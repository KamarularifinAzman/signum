<?php
/**
 * Personal Signature API
 * Adds timestamp to personally signed PDF
 * 
 * POST /api/sign-personal.php
 * Body: { pdfBase64, marks, timestamp }
 **/
// Enable all error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);

// Log everything
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/../logs/php_errors.log');

// Create logs directory if it doesn't exist
$logDir = __DIR__ . '/../logs';
if (!is_dir($logDir)) {
    mkdir($logDir, 0755, true);
}

// Log the request start
error_log("=== SIGN-PERSONAL REQUEST START ===");
error_log("Request method: " . $_SERVER['REQUEST_METHOD']);
error_log("Content type: " . ($_SERVER['CONTENT_TYPE'] ?? 'Not set'));

// Check if Composer autoload exists
$vendorPath = __DIR__ . '/../vendor/autoload.php';
if (!file_exists($vendorPath)) {
    error_log("ERROR: Composer autoload not found at: " . $vendorPath);
    http_response_code(500);
    echo json_encode(['error' => 'Server configuration error: Composer not set up']);
    exit;
}

require_once $vendorPath;
use setasign\Fpdi\Fpdi;

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit(0);
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

// Validate input
if (!isset($input['pdfBase64']) || !isset($input['marks'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields: pdfBase64 and marks']);
    exit;
}

try {
    // Log start
    error_log("=== SIGN-PERSONAL START ===");
    error_log("Marks count: " . count($input['marks']));
    
    // Decode and validate PDF
    $pdfData = base64_decode($input['pdfBase64']);
    if (strlen($pdfData) < 100 || substr($pdfData, 0, 4) !== '%PDF') {
        throw new Exception('Invalid PDF data');
    }
    
    $marks = $input['marks'];
    
    // Save to temp file
    $tempPdf = tempnam(sys_get_temp_dir(), 'upload_') . '.pdf';
    file_put_contents($tempPdf, $pdfData);
    error_log("Temp PDF saved: " . filesize($tempPdf) . " bytes");
    
    // Initialize FPDI
    $pdf = new Fpdi();
    
    // Get page count
    $pageCount = $pdf->setSourceFile($tempPdf);
    error_log("Page count: " . $pageCount);
    
    if ($pageCount < 1) {
        throw new Exception('No pages found in PDF');
    }
    
    // Group marks by page
    $marksByPage = [];
    foreach ($marks as $mark) {
        $page = (int)$mark['page'];
        if ($page < 1 || $page > $pageCount) {
            error_log("Warning: Mark on invalid page {$page}, adjusting to page 1");
            $page = 1;
        }
        if (!isset($marksByPage[$page])) {
            $marksByPage[$page] = [];
        }
        $marksByPage[$page][] = $mark;
    }
    
    // Process each page
    for ($pageNo = 1; $pageNo <= $pageCount; $pageNo++) {
        // Import page
        $templateId = $pdf->importPage($pageNo);
        $size = $pdf->getTemplateSize($templateId);
        
        // Add page with original dimensions
        $orientation = ($size['width'] > $size['height']) ? 'L' : 'P';
        $pdf->AddPage($orientation, [$size['width'], $size['height']]);
        
        // Use imported page
        $pdf->useTemplate($templateId, 0, 0, $size['width'], $size['height']);
        
        // Apply marks for this page
        if (isset($marksByPage[$pageNo])) {
            foreach ($marksByPage[$pageNo] as $mark) {
                applyMarkToPage($pdf, $mark, $size['width'], $size['height']);
            }
        }
    }
    
    // Add audit page
    addAuditPage($pdf, $marks);
    
    // Output PDF
    $signedContent = $pdf->Output('S');
    
    // Cleanup
    if (file_exists($tempPdf)) {
        unlink($tempPdf);
    }
    
    // Create audit trail
    $auditTrail = [
        'timestamp' => date('Y-m-d H:i:s'),
        'ip' => $_SERVER['REMOTE_ADDR'] ?? 'Unknown',
        'userAgent' => $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown',
        'marksCount' => count($marks),
        'pageCount' => $pageCount
    ];
    
    // Log success
    error_log("PDF processing successful. Output size: " . strlen($signedContent));
    
    echo json_encode([
        'success' => true,
        'signedPdf' => base64_encode($signedContent),
        'auditTrail' => $auditTrail,
        'processingTime' => microtime(true) - $_SERVER['REQUEST_TIME_FLOAT']
    ]);
    
} catch (Exception $e) {
    // Cleanup on error
    if (isset($tempPdf) && file_exists($tempPdf)) {
        unlink($tempPdf);
    }
    
    error_log("ERROR: " . $e->getMessage());
    error_log("TRACE: " . $e->getTraceAsString());
    
    http_response_code(500);
    echo json_encode([
        'error' => 'PDF processing failed: ' . $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ]);
}

/**
 * Apply a mark to the PDF page with correct coordinates
 */
function applyMarkToPage($pdf, $mark, $pageWidth, $pageHeight) {
    try {
        // Convert from A4 points (595x842) to current page coordinates
        $x = floatval($mark['x']);
        $y = floatval($mark['y']);
        $width = floatval($mark['width']);
        $height = floatval($mark['height']);
        
        // Convert from points to mm for FPDF (1 point = 0.3528 mm)
        $x = $x * 0.3528;
        $y = $y * 0.3528;
        $width = $width * 0.3528;
        $height = $height * 0.3528;
        
        // Adjust Y coordinate (FPDF origin is top-left, PDF.js might be bottom-left)
        // If marks appear inverted, adjust this
        $y = $y; // Try without inversion first
        
        error_log("Applying mark: {$mark['type']} at x={$x}mm, y={$y}mm, w={$width}mm, h={$height}mm");
        
        if ($mark['type'] === 'signature' || $mark['type'] === 'initial') {
            applyImageMark($pdf, $mark, $x, $y, $width, $height);
        } elseif ($mark['type'] === 'text') {
            applyTextMark($pdf, $mark, $x, $y);
        } elseif ($mark['type'] === 'digital') {
            applyDigitalMark($pdf, $mark, $x, $y, $width, $height);
        }
        
    } catch (Exception $e) {
        error_log("Failed to apply mark: " . $e->getMessage());
    }
}

/**
 * Apply image-based mark (signature/initial)
 */
function applyImageMark($pdf, $mark, $x, $y, $width, $height) {
    if (!isset($mark['image']) || empty($mark['image'])) {
        error_log("No image data for {$mark['type']}");
        return;
    }
    
    // Extract base64 image
    if (preg_match('/^data:image\/(png|jpeg|jpg);base64,(.+)$/i', $mark['image'], $matches)) {
        $imageType = strtolower($matches[1]);
        $imageData = base64_decode($matches[2]);
        
        if (!$imageData) {
            error_log("Failed to decode base64 image");
            return;
        }
        
        // Save to temp file
        $tempImage = tempnam(sys_get_temp_dir(), 'img_') . '.' . ($imageType === 'jpeg' ? 'jpg' : 'png');
        file_put_contents($tempImage, $imageData);
        
        // Add image to PDF
        if (file_exists($tempImage)) {
            $pdf->Image($tempImage, $x, $y, $width, $height);
            unlink($tempImage);
            error_log("Image added successfully");
        }
    } else {
        error_log("Invalid image format for {$mark['type']}");
    }
}

/**
 * Apply text mark
 */
function applyTextMark($pdf, $mark, $x, $y) {
    if (!isset($mark['text']) || empty(trim($mark['text']))) {
        return;
    }
    
    $fontSize = isset($mark['fontSize']) ? floatval($mark['fontSize']) * 0.3528 : 12 * 0.3528;
    
    $pdf->SetFont('Helvetica', '', $fontSize);
    $pdf->SetTextColor(0, 0, 0);
    $pdf->SetXY($x, $y);
    $pdf->Write(0, $mark['text']);
    
    error_log("Text added: " . substr($mark['text'], 0, 50));
}

/**
 * Apply digital signature placeholder
 */
function applyDigitalMark($pdf, $mark, $x, $y, $width, $height) {
    // Draw background
    $pdf->SetFillColor(220, 252, 231);
    $pdf->Rect($x, $y, $width, $height, 'F');
    
    // Draw border
    $pdf->SetDrawColor(22, 163, 74);
    $pdf->SetLineWidth(0.5);
    $pdf->Rect($x, $y, $width, $height, 'D');
    
    // Add text
    $pdf->SetFont('Helvetica', 'B', 10 * 0.3528);
    $pdf->SetTextColor(21, 128, 61);
    
    $textY = $y + 5;
    $pdf->SetXY($x, $textY);
    $pdf->Cell($width, 5, 'DIGITALLY SIGNED', 0, 0, 'C');
    
    if (isset($mark['digitalData']['staffName'])) {
        $textY += 8;
        $pdf->SetFont('Helvetica', '', 8 * 0.3528);
        $pdf->SetXY($x, $textY);
        $pdf->Cell($width, 5, 'By: ' . $mark['digitalData']['staffName'], 0, 0, 'C');
    }
}

/**
 * Add audit page
 */
function addAuditPage($pdf, $marks) {
    $pdf->AddPage();
    
    $pdf->SetFont('Helvetica', 'B', 16);
    $pdf->Cell(0, 10, 'Document Audit Trail', 0, 1, 'C');
    $pdf->Ln(10);
    
    $pdf->SetFont('Helvetica', '', 12);
    $pdf->Cell(0, 8, 'Signing Date: ' . date('Y-m-d H:i:s'), 0, 1);
    $pdf->Cell(0, 8, 'Total Elements: ' . count($marks), 0, 1);
    
    // List marks by type
    $typeCounts = [];
    foreach ($marks as $mark) {
        $type = $mark['type'];
        $typeCounts[$type] = ($typeCounts[$type] ?? 0) + 1;
    }
    
    $pdf->Ln(5);
    $pdf->Cell(0, 8, 'Elements by Type:', 0, 1);
    foreach ($typeCounts as $type => $count) {
        $pdf->Cell(0, 8, "  - {$type}: {$count}", 0, 1);
    }
}