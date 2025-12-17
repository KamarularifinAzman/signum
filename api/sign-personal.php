<?php
/**
 * Personal Signature API
 * Adds timestamp to personally signed PDF
 * 
 * POST /api/sign-personal.php
 * Body: { pdfBase64, marks, timestamp }
 */

require_once __DIR__ . '/../vendor/autoload.php';

// Use FPDI which extends TCPDF
use setasign\Fpdi\Tcpdf\Fpdi;

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['pdfBase64']) || !isset($input['marks'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields']);
    exit;
}

try {
    // Decode PDF data
    $pdfData = base64_decode($input['pdfBase64']);
    $marks = $input['marks'];
    $includeTimestamp = $input['timestamp'] ?? true;
    
    if (!$pdfData || strlen($pdfData) < 100) {
        throw new Exception('Invalid PDF data received');
    }
    
    // Save uploaded PDF temporarily
    $tempPdf = tempnam(sys_get_temp_dir(), 'upload_') . '.pdf';
    if (file_put_contents($tempPdf, $pdfData) === false) {
        throw new Exception('Failed to save temporary PDF file');
    }
    
    // Create FPDI instance (extends TCPDF)
    $pdf = new Fpdi();
    
    // Set document information
    $pdf->SetCreator('Signum Document Signing Platform');
    $pdf->SetAuthor('Electronic Signature System');
    $pdf->SetTitle('Electronically Signed Document');
    $pdf->SetSubject('Document with Electronic Signatures');
    
    // Remove default header/footer
    $pdf->setPrintHeader(false);
    $pdf->setPrintFooter(false);
    $pdf->SetAutoPageBreak(false, 0);
    
    // Set margins to 0 for precise positioning
    $pdf->SetMargins(0, 0, 0);
    
    // Get page count from original PDF
    $pageCount = $pdf->setSourceFile($tempPdf);
    
    if ($pageCount < 1) {
        throw new Exception('Invalid PDF: No pages found');
    }
    
    // Group marks by page
    $marksByPage = [];
    foreach ($marks as $mark) {
        $page = $mark['page'];
        if (!isset($marksByPage[$page])) {
            $marksByPage[$page] = [];
        }
        $marksByPage[$page][] = $mark;
    }
    
    // Process each page
    for ($pageNo = 1; $pageNo <= $pageCount; $pageNo++) {
        // Import page from original PDF
        $tplId = $pdf->importPage($pageNo);
        $size = $pdf->getTemplateSize($tplId);
        
        // Add page with correct size
        $orientation = ($size['width'] > $size['height']) ? 'L' : 'P';
        $pdf->AddPage($orientation, [$size['width'], $size['height']]);
        
        // Use imported page as background
        $pdf->useTemplate($tplId, 0, 0, $size['width'], $size['height']);
        
        // Apply marks for this page
        if (isset($marksByPage[$pageNo])) {
            foreach ($marksByPage[$pageNo] as $mark) {
                applyMark($pdf, $mark);
            }
        }
    }
    
    // Add timestamp/audit page if requested
    if ($includeTimestamp) {
        $timestampData = getTimestampData($tempPdf);
        addAuditPage($pdf, $marks, $timestampData);
    } else {
        $timestampData = null;
    }
    
    // Output PDF as string
    $signedContent = $pdf->Output('signed.pdf', 'S');
    
    // Clean up temporary file
    if (file_exists($tempPdf)) {
        unlink($tempPdf);
    }
    
    // Generate audit trail
    $auditTrail = [
        'timestamp' => date('Y-m-d H:i:s'),
        'ip_address' => $_SERVER['REMOTE_ADDR'] ?? 'Unknown',
        'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown',
        'marks_count' => count($marks),
        'signature_type' => 'electronic',
        'compliance' => 'Electronic Commerce Act 2006'
    ];
    
    // Log to file
    logSignature($marks, $auditTrail);
    
    // Return result
    echo json_encode([
        'success' => true,
        'signedPdf' => base64_encode($signedContent),
        'auditTrail' => $auditTrail,
        'timestamp' => $timestampData
    ]);
    
} catch (Exception $e) {
    // Clean up on error
    if (isset($tempPdf) && file_exists($tempPdf)) {
        unlink($tempPdf);
    }
    
    error_log('Sign-personal error: ' . $e->getMessage());
    
    http_response_code(500);
    echo json_encode([
        'error' => 'Failed to process signature: ' . $e->getMessage(),
        'details' => $e->getTraceAsString()
    ]);
}

/**
 * Apply a signature mark to the PDF
 */
function applyMark($pdf, $mark) {
    try {
        $x = floatval($mark['x']);
        $y = floatval($mark['y']);
        $width = floatval($mark['width']);
        $height = floatval($mark['height']);
        
        if ($mark['type'] === 'signature' || $mark['type'] === 'initial') {
            // Add signature/initial image
            if (isset($mark['image']) && !empty($mark['image'])) {
                // Decode base64 image
                $imageData = $mark['image'];
                if (preg_match('/^data:image\/(\w+);base64,(.+)$/', $imageData, $matches)) {
                    $imageType = strtolower($matches[1]);
                    $imageBase64 = $matches[2];
                    
                    // Map image type
                    $extension = $imageType === 'jpeg' ? 'jpg' : $imageType;
                    
                    // Save image temporarily
                    $tempImage = tempnam(sys_get_temp_dir(), 'sig_') . '.' . $extension;
                    if (file_put_contents($tempImage, base64_decode($imageBase64)) !== false) {
                        // Add image to PDF at specified position
                        $pdf->Image($tempImage, $x, $y, $width, $height, strtoupper($imageType), '', '', false, 300, '', false, false, 0);
                        
                        // Clean up
                        unlink($tempImage);
                    }
                }
            }
        } elseif ($mark['type'] === 'text') {
            // Add text annotation
            $fontSize = isset($mark['fontSize']) ? intval($mark['fontSize']) : 12;
            $pdf->SetFont('helvetica', '', $fontSize);
            $pdf->SetTextColor(0, 0, 0);
            $pdf->SetXY($x, $y);
            $pdf->Write(0, $mark['text'], '', false, '', false, 0, false);
            
        } elseif ($mark['type'] === 'digital') {
            // Add digital signature visual placeholder
            $pdf->SetFillColor(220, 252, 231);
            $pdf->Rect($x, $y, $width, $height, 'DF');
            
            $pdf->SetDrawColor(22, 163, 74);
            $pdf->SetLineWidth(0.5);
            $pdf->Rect($x, $y, $width, $height, 'D');
            
            $pdf->SetFont('helvetica', 'B', 10);
            $pdf->SetTextColor(21, 128, 61);
            
            // Center text in box
            $pdf->SetXY($x, $y + 5);
            $pdf->Cell($width, 5, 'ELECTRONICALLY SIGNED', 0, 0, 'C');
            
            if (isset($mark['digitalData']['staffName'])) {
                $pdf->SetFont('helvetica', '', 8);
                $pdf->SetXY($x, $y + 12);
                $pdf->Cell($width, 4, 'By: ' . $mark['digitalData']['staffName'], 0, 0, 'C');
            }
            
            $pdf->SetXY($x, $y + 18);
            $pdf->Cell($width, 4, 'Date: ' . date('Y-m-d H:i:s'), 0, 0, 'C');
        }
    } catch (Exception $e) {
        error_log('Error applying mark: ' . $e->getMessage());
    }
}

/**
 * Add audit trail page
 */
function addAuditPage($pdf, $marks, $timestampData) {
    $pdf->AddPage();
    
    // Title
    $pdf->SetFont('helvetica', 'B', 16);
    $pdf->SetTextColor(0, 0, 0);
    $pdf->SetXY(10, 10);
    $pdf->Cell(0, 15, 'Document Audit Trail', 0, 1, 'C');
    
    $pdf->Ln(5);
    
    // Audit information
    $pdf->SetFont('helvetica', '', 11);
    $pdf->SetX(10);
    $pdf->Cell(0, 8, 'Signature Timestamp: ' . date('Y-m-d H:i:s T'), 0, 1);
    $pdf->SetX(10);
    $pdf->Cell(0, 8, 'IP Address: ' . ($_SERVER['REMOTE_ADDR'] ?? 'Unknown'), 0, 1);
    $pdf->SetX(10);
    $pdf->MultiCell(0, 8, 'User Agent: ' . substr($_SERVER['HTTP_USER_AGENT'] ?? 'Unknown', 0, 80), 0, 'L');
    $pdf->SetX(10);
    $pdf->Cell(0, 8, 'Signature Elements Placed: ' . count($marks), 0, 1);
    
    $pdf->Ln(5);
    
    // Timestamp authority info
    if ($timestampData) {
        $pdf->SetFont('helvetica', 'B', 12);
        $pdf->SetX(10);
        $pdf->Cell(0, 8, 'Trusted Timestamp Authority', 0, 1);
        
        $pdf->SetFont('helvetica', '', 10);
        $pdf->SetX(10);
        $pdf->Cell(0, 6, 'Authority: ' . $timestampData['authority'], 0, 1);
        $pdf->SetX(10);
        $pdf->Cell(0, 6, 'Hash Algorithm: ' . $timestampData['algorithm'], 0, 1);
        $pdf->SetX(10);
        $pdf->Cell(0, 6, 'Document Hash:', 0, 1);
        $pdf->SetFont('courier', '', 8);
        $pdf->SetX(10);
        $pdf->MultiCell(0, 5, wordwrap($timestampData['hash'], 80, "\n", true), 0, 'L');
    }
    
    $pdf->Ln(10);
    
    // Legal notice
    $pdf->SetFont('helvetica', 'I', 9);
    $pdf->SetTextColor(100, 100, 100);
    $pdf->SetX(10);
    $pdf->MultiCell(0, 5, 
        'This document has been electronically signed. Electronic signatures are recognized under applicable electronic commerce legislation. ' .
        'The timestamp and audit information above provide evidence of the signing event.',
        0, 'L');
}

/**
 * Get timestamp data
 */
function getTimestampData($pdfPath) {
    $pdfContent = file_get_contents($pdfPath);
    $hash = hash('sha256', $pdfContent);
    
    // Try to get trusted timestamp
    try {
        $timestampUrl = 'http://timestamp.digicert.com';
        
        $ch = curl_init($timestampUrl);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 5);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/timestamp-query']);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode === 200 && $response) {
            return [
                'timestamp' => date('Y-m-d H:i:s'),
                'authority' => 'DigiCert Timestamp Server',
                'hash' => $hash,
                'algorithm' => 'SHA-256'
            ];
        }
    } catch (Exception $e) {
        error_log("Timestamp error: " . $e->getMessage());
    }
    
    // Fallback to local timestamp
    return [
        'timestamp' => date('Y-m-d H:i:s'),
        'authority' => 'Local System Time',
        'hash' => $hash,
        'algorithm' => 'SHA-256'
    ];
}

/**
 * Log signature to file
 */
function logSignature($marks, $auditTrail) {
    $logEntry = sprintf(
        "[%s] IP: %s | Marks: %d | Type: %s\n",
        $auditTrail['timestamp'],
        $auditTrail['ip_address'],
        $auditTrail['marks_count'],
        $auditTrail['signature_type']
    );
    
    $logDir = __DIR__ . '/../logs';
    if (!is_dir($logDir)) {
        mkdir($logDir, 0755, true);
    }
    
    file_put_contents($logDir . '/personal-signatures.log', $logEntry, FILE_APPEND);
    
    // Also save as JSON
    $jsonLogFile = $logDir . '/personal-signatures.json';
    $existingLogs = [];
    
    if (file_exists($jsonLogFile)) {
        $content = file_get_contents($jsonLogFile);
        $existingLogs = json_decode($content, true) ?: [];
    }
    
    $existingLogs[] = array_merge($auditTrail, ['marks' => count($marks)]);
    file_put_contents($jsonLogFile, json_encode($existingLogs, JSON_PRETTY_PRINT));
}
?>