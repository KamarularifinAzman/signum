<?php
/**
 * Company Certificate Signature API
 * Signs PDF using company SSL certificate with open-pdf-sign.jar
 * 
 * POST /api/sign-company.php
 * Body: { pdfBase64, staffName, staffNumber, timestamp }
 */

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

// Validate required fields
$required = ['pdfBase64', 'staffName', 'staffNumber', 'marks'];
foreach ($required as $field) {
    if (!isset($input[$field])) {
        http_response_code(400);
        echo json_encode(['error' => "Missing required field: {$field}"]);
        exit;
    }
}

try {
    error_log("=== SIGN-COMPANY START ===");
    
    // Decode PDF
    $pdfData = base64_decode($input['pdfBase64']);
    if (strlen($pdfData) < 100) {
        throw new Exception('Invalid PDF data (too small)');
    }
    
    // Validate PDF signature
    if (substr($pdfData, 0, 4) !== '%PDF') {
        throw new Exception('Invalid PDF format');
    }
    
    // Save to temp file
    $tempDir = sys_get_temp_dir();
    $inputFile = tempnam($tempDir, 'input_') . '.pdf';
    $outputFile = tempnam($tempDir, 'signed_') . '.pdf';
    
    file_put_contents($inputFile, $pdfData);
    error_log("Input PDF saved: {$inputFile}, Size: " . filesize($inputFile));
    
    // Get first digital signature mark for positioning
    $digitalMark = null;
    foreach ($input['marks'] as $mark) {
        if ($mark['type'] === 'digital') {
            $digitalMark = $mark;
            break;
        }
    }
    
    if (!$digitalMark) {
        throw new Exception('No digital signature mark found in document');
    }
    
    // Use local certificate paths (adjust these to your actual paths)
    $certPath = 'C:/xampp/apache/conf/ssl.crt/fullchain.pem';
    $keyPath = 'C:/xampp/apache/conf/ssl.key/server.key';
    
    if (!file_exists($certPath)) {
        throw new Exception("Certificate not found at: {$certPath}");
    }
    if (!file_exists($keyPath)) {
        throw new Exception("Private key not found at: {$keyPath}");
    }
    
    error_log("Using certificate: {$certPath}");
    
    // Prepare command for open-pdf-sign.jar
    $javaPath = 'java';
    $jarPath = __DIR__ . '/../lib/open-pdf-sign.jar';
    
    if (!file_exists($jarPath)) {
     error_log("JAR file not found at: " . $jarPath);
     throw new Exception("open-pdf-sign.jar not found at: " . $jarPath);
    }
    
    // Extract signing info
    $staffName = escapeshellarg($input['staffName']);
    $companyName = isset($input['companyName']) ? escapeshellarg($input['companyName']) : escapeshellarg('Your Company');
    $reason = isset($input['signingReason']) ? escapeshellarg($input['signingReason']) : escapeshellarg('Document signing');
    $location = isset($input['signingLocation']) ? escapeshellarg($input['signingLocation']) : escapeshellarg('Corporate Headquarters');
    
    // Also check Java is available
    $javaCheck = shell_exec('java -version 2>&1');
    if (strpos($javaCheck, 'version') === false) {
        throw new Exception('Java is not installed or not in PATH');
    }

    // Get position from mark (convert from points to PDF points)
    $page = intval($digitalMark['page']);
    $x = intval($digitalMark['x']);
    $y = intval($digitalMark['y']);
    $width = intval($digitalMark['width']);
    $height = intval($digitalMark['height']);
    
    // Build command
    $command = sprintf(
        '%s -jar "%s" sign --source "%s" --destination "%s" --certificate "%s" --key "%s" --page %d --llx %d --lly %d --urx %d --ury %d --name %s --reason %s --location %s',
        $javaPath,
        $jarPath,
        $inputFile,
        $outputFile,
        $certPath,
        $keyPath,
        $page,
        $x,
        842 - $y - $height, // Adjust Y coordinate (PDF coordinate system)
        $x + $width,
        842 - $y, // Adjust Y coordinate
        $staffName,
        $reason,
        $location
    );
    
    // Add timestamp if requested
    if (isset($input['includeTimestamp']) && $input['includeTimestamp']) {
        $command .= ' --tsa http://timestamp.digicert.com';
    }
    
    // Add encryption if requested
    if (isset($input['finaliseDocument']) && $input['finaliseDocument']) {
        $command .= ' --encrypt';
        if (isset($input['password']) && !empty($input['password'])) {
            $command .= ' --password ' . escapeshellarg($input['password']);
        }
    }
    
    error_log("Executing command: " . substr($command, 0, 200) . "...");
    
    // Execute command
    $output = [];
    $returnCode = 0;
    exec($command . ' 2>&1', $output, $returnCode);
    
    error_log("Command output: " . implode("\n", $output));
    
    if ($returnCode !== 0) {
        throw new Exception('PDF signing failed. Return code: ' . $returnCode . '. Output: ' . implode("\n", $output));
    }
    
    if (!file_exists($outputFile)) {
        throw new Exception('Output file was not created');
    }
    
    // Read signed PDF
    $signedPdf = file_get_contents($outputFile);
    if (!$signedPdf) {
        throw new Exception('Failed to read signed PDF');
    }
    
    error_log("PDF signed successfully. Output size: " . strlen($signedPdf));
    
    // Log the action
    logCompanySignature([
        'timestamp' => date('Y-m-d H:i:s'),
        'staffName' => $input['staffName'],
        'staffNumber' => $input['staffNumber'],
        'ip' => $_SERVER['REMOTE_ADDR'] ?? 'Unknown',
        'success' => true
    ]);
    
    // Cleanup temp files
    unlink($inputFile);
    unlink($outputFile);
    
    // Return result
    echo json_encode([
        'success' => true,
        'signedPdf' => base64_encode($signedPdf),
        'fileName' => 'digitally_signed_' . date('Ymd_His') . '.pdf',
        'certificateInfo' => [
            'subject' => 'Company Certificate',
            'issuer' => 'Your Certificate Authority',
            'validFrom' => date('Y-m-d'),
            'validTo' => date('Y-m-d', strtotime('+1 year'))
        ],
        'signatureDetails' => [
            'staffName' => $input['staffName'],
            'companyName' => $input['companyName'] ?? 'Your Company',
            'timestamp' => date('Y-m-d H:i:s'),
            'page' => $page,
            'position' => ['x' => $x, 'y' => $y]
        ]
    ]);
    
} catch (Exception $e) {
    // Cleanup on error
    if (isset($inputFile) && file_exists($inputFile)) unlink($inputFile);
    if (isset($outputFile) && file_exists($outputFile)) unlink($outputFile);
    
    error_log("COMPANY SIGN ERROR: " . $e->getMessage());
    
    // Log failure
    if (isset($input['staffName'])) {
        logCompanySignature([
            'timestamp' => date('Y-m-d H:i:s'),
            'staffName' => $input['staffName'],
            'staffNumber' => $input['staffNumber'] ?? 'Unknown',
            'ip' => $_SERVER['REMOTE_ADDR'] ?? 'Unknown',
            'success' => false,
            'error' => $e->getMessage()
        ]);
    }
    
    http_response_code(500);
    echo json_encode([
        'error' => 'Company signature failed: ' . $e->getMessage(),
        'details' => $e->getTraceAsString()
    ]);
}

/**
 * Log company signature actions
 */
function logCompanySignature($data) {
    $logDir = __DIR__ . '/../logs';
    if (!is_dir($logDir)) {
        mkdir($logDir, 0755, true);
    }
    
    $logFile = $logDir . '/company_signatures.log';
    $jsonLogFile = $logDir . '/company_signatures.json';
    
    // Text log
    $logLine = sprintf(
        "[%s] %s (%s) - IP: %s - Success: %s - %s\n",
        $data['timestamp'],
        $data['staffName'] ?? 'Unknown',
        $data['staffNumber'] ?? 'Unknown',
        $data['ip'] ?? 'Unknown',
        $data['success'] ? 'YES' : 'NO',
        $data['error'] ?? 'Signed'
    );
    
    file_put_contents($logFile, $logLine, FILE_APPEND);
    
    // JSON log
    $jsonLog = [];
    if (file_exists($jsonLogFile)) {
        $jsonLog = json_decode(file_get_contents($jsonLogFile), true) ?: [];
    }
    
    $jsonLog[] = $data;
    file_put_contents($jsonLogFile, json_encode($jsonLog, JSON_PRETTY_PRINT));
}