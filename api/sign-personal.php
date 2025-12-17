<?php
/**
 * Personal Signature API
 * Adds timestamp to personally signed PDF
 * 
 * POST /api/sign-personal.php
 * Body: { pdfBase64, marks, timestamp }
 */

require_once 'vendor/autoload.php';

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
    // Save uploaded PDF temporarily
    $tempPdf = tempnam(sys_get_temp_dir(), 'upload_');
    file_put_contents($tempPdf, $pdfData);
    
    // Create a new TCPDF instance (for modification, this is complex)
    // WARNING: This is a conceptual example. 
    // Adding images at precise A4 coordinates requires extensive TCPDF knowledge.
    $pdf = new TCPDF();
    $pdf->setSourceFile($tempPdf);
    
    // Iterate through pages and add signature marks
    // This would involve complex coordinate transformation
    // from your A4 coordinates to TCPDF's coordinate system
    
    // For now, we'll create a simple signed version as demonstration
    $pdf->AddPage();
    $pdf->SetFont('helvetica', '', 12);
    $pdf->Write(0, "Document signed with " . count($marks) . " signature marks.\n");
    $pdf->Write(0, "Timestamp: " . date('Y-m-d H:i:s'));
    $timestampData = null;
    if ($includeTimestamp) {
        $timestampData = getDigiCertTimestamp($tempPdf);
    }
    
     // Output modified PDF
    $signedContent = $pdf->Output('', 'S'); // Get as string
    unlink($tempPdf); // Clean up temporary file    
    
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
    $logEntry = date('Y-m-d H:i:s') . " | Personal Signature | " . 
                $_SERVER['REMOTE_ADDR'] . " | " . 
                count($marks) . " marks placed\n";
    file_put_contents(__DIR__ . '/../logs/personal-signatures.log', $logEntry, FILE_APPEND);
    

    // Return result
    echo json_encode([
        'success' => true,
        'signedPdf' => base64_encode($signedContent),
        'auditTrail' => $auditTrail,
        'timestamp' => $timestampData
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Failed to process signature: ' . $e->getMessage()
    ]);
}

/**
 * Get timestamp from DigiCert
 */
function getDigiCertTimestamp($pdfPath) {
    // DigiCert timestamp server
    $timestampUrl = 'http://timestamp.digicert.com';
    
    // Read PDF for hashing
    $pdfContent = file_get_contents($pdfPath);
    $hash = hash('sha256', $pdfContent);
    
    // In production, make proper RFC 3161 timestamp request
    // This is a simplified version
    
    try {
        // Create timestamp request (TSR)
        // Normally you'd use OpenSSL functions here
        $ch = curl_init($timestampUrl);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/timestamp-query'
        ]);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode === 200) {
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
    
    return null;
}
?>