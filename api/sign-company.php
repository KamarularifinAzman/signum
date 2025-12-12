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

if (!isset($input['pdfBase64']) || !isset($input['staffName']) || !isset($input['staffNumber'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields']);
    exit;
}

try {
    $pdfData = base64_decode($input['pdfBase64']);
    $staffName = $input['staffName'];
    $staffNumber = $input['staffNumber'];
    $includeTimestamp = $input['timestamp'] ?? true;
    
    // Save temporary PDF
    $tempPdf = tempnam(sys_get_temp_dir(), 'pdf_');
    $outputPdf = tempnam(sys_get_temp_dir(), 'signed_pdf_');
    file_put_contents($tempPdf, $pdfData);
    
    // 1. Fetch company certificate from cPanel
    $certData = fetchCertificateFromCPanel();
    
    if (!$certData) {
        throw new Exception('Failed to retrieve company certificate');
    }
    
    // Save certificate temporarily
    $certFile = tempnam(sys_get_temp_dir(), 'cert_');
    file_put_contents($certFile, $certData['certificate']);
    
    // 2. Get certificate password from Windows Credential Manager
    $certPassword = getCredentialFromWindows('CompanyCertPassword');
    
    if (!$certPassword) {
        throw new Exception('Failed to retrieve certificate password');
    }
    
    // 3. Build open-pdf-sign command
    $javaPath = 'java'; // Adjust if Java not in PATH
    $jarPath = __DIR__ . '/../lib/open-pdf-sign.jar';
    $timestampServer = 'http://timestamp.digicert.com';
    
    $command = sprintf(
        '%s -jar "%s" -i "%s" -o "%s" -c "%s" -p "%s" -n "%s" -s visible -t "%s"',
        escapeshellarg($javaPath),
        escapeshellarg($jarPath),
        escapeshellarg($tempPdf),
        escapeshellarg($outputPdf),
        escapeshellarg($certFile),
        escapeshellarg($certPassword),
        escapeshellarg($staffName),
        $includeTimestamp ? escapeshellarg($timestampServer) : ''
    );
    
    // 4. Execute open-pdf-sign
    $output = [];
    $returnCode = 0;
    exec($command . ' 2>&1', $output, $returnCode);
    
    if ($returnCode !== 0) {
        throw new Exception('PDF signing failed: ' . implode("\n", $output));
    }
    
    // 5. Read signed PDF
    $signedPdf = file_get_contents($outputPdf);
    
    // 6. Log the signing action
    $logEntry = [
        'timestamp' => date('Y-m-d H:i:s'),
        'staff_name' => $staffName,
        'staff_number' => $staffNumber,
        'ip_address' => $_SERVER['REMOTE_ADDR'] ?? 'Unknown',
        'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown',
        'certificate_subject' => $certData['subject'],
        'success' => true
    ];
    
    logCompanySignature($logEntry);
    
    // 7. Clean up temporary files
    unlink($tempPdf);
    unlink($outputPdf);
    unlink($certFile);
    
    // 8. Return result
    echo json_encode([
        'success' => true,
        'signedPdf' => base64_encode($signedPdf),
        'certificateInfo' => [
            'subject' => $certData['subject'],
            'issuer' => $certData['issuer'],
            'validFrom' => $certData['validFrom'],
            'validTo' => $certData['validTo']
        ],
        'timestamp' => date('Y-m-d H:i:s'),
        'staffName' => $staffName,
        'staffNumber' => $staffNumber
    ]);
    
} catch (Exception $e) {
    // Log error
    $errorLog = [
        'timestamp' => date('Y-m-d H:i:s'),
        'staff_name' => $staffName ?? 'Unknown',
        'staff_number' => $staffNumber ?? 'Unknown',
        'error' => $e->getMessage(),
        'success' => false
    ];
    logCompanySignature($errorLog);
    
    http_response_code(500);
    echo json_encode([
        'error' => 'Failed to sign with company certificate: ' . $e->getMessage()
    ]);
}

/**
 * Fetch certificate from cPanel API
 */
function fetchCertificateFromCPanel() {
    // Get cPanel credentials from Windows Credential Manager
    $cpanelUrl = getCredentialFromWindows('cPanelURL');
    $cpanelToken = getCredentialFromWindows('cPanelAPIToken');
    
    if (!$cpanelUrl || !$cpanelToken) {
        return null;
    }
    
    // cPanel API v2 - SSL Module
    $apiUrl = $cpanelUrl . '/execute/SSL/fetch_best_for_domain';
    $domain = parse_url($cpanelUrl, PHP_URL_HOST);
    
    $ch = curl_init($apiUrl . '?domain=' . urlencode($domain));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: cpanel ' . $cpanelToken
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode === 200) {
        $data = json_decode($response, true);
        
        if ($data && isset($data['data'])) {
            $cert = $data['data'];
            
            // Parse certificate details
            $certDetails = openssl_x509_parse($cert['crt']);
            
            return [
                'certificate' => $cert['crt'],
                'privateKey' => $cert['key'],
                'subject' => $certDetails['subject']['CN'] ?? 'Unknown',
                'issuer' => $certDetails['issuer']['CN'] ?? 'Unknown',
                'validFrom' => date('Y-m-d H:i:s', $certDetails['validFrom_time_t']),
                'validTo' => date('Y-m-d H:i:s', $certDetails['validTo_time_t'])
            ];
        }
    }
    
    return null;
}

/**
 * Get credential from Windows Credential Manager
 * Uses PowerShell to retrieve stored credentials
 */
function getCredentialFromWindows($targetName) {
    // PowerShell command to retrieve credential
    $psCommand = sprintf(
        'powershell -Command "$cred = Get-StoredCredential -Target \'%s\'; if ($cred) { $cred.GetNetworkCredential().Password }"',
        $targetName
    );
    
    $output = shell_exec($psCommand);
    
    if ($output) {
        return trim($output);
    }
    
    return null;
}

/**
 * Log company signature action
 */
function logCompanySignature($logEntry) {
    $logFile = __DIR__ . '/../logs/company-signatures.log';
    
    // Ensure log directory exists
    $logDir = dirname($logFile);
    if (!is_dir($logDir)) {
        mkdir($logDir, 0755, true);
    }
    
    // Format log entry
    $logLine = sprintf(
        "[%s] Staff: %s (%s) | IP: %s | Success: %s | %s\n",
        $logEntry['timestamp'],
        $logEntry['staff_name'],
        $logEntry['staff_number'],
        $logEntry['ip_address'],
        $logEntry['success'] ? 'YES' : 'NO',
        $logEntry['error'] ?? 'Signed successfully'
    );
    
    file_put_contents($logFile, $logLine, FILE_APPEND);
    
    // Also log as JSON for structured parsing
    $jsonLogFile = __DIR__ . '/../logs/company-signatures.json';
    $existingLogs = [];
    
    if (file_exists($jsonLogFile)) {
        $existingLogs = json_decode(file_get_contents($jsonLogFile), true) ?: [];
    }
    
    $existingLogs[] = $logEntry;
    file_put_contents($jsonLogFile, json_encode($existingLogs, JSON_PRETTY_PRINT));
}
?>