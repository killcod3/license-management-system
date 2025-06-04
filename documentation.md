# License Verification API Documentation

This document provides detailed information on how to integrate the License Verification API into your software applications.

## Overview

The License Management System provides a secure API endpoint for verifying licenses in your software products. The API uses AES encryption for all requests and responses to ensure the security of license keys and other sensitive information.

## Endpoint

```
POST /api/license-verification/verify
```

## Security Implementation

All communication with the API is encrypted using AES (Advanced Encryption Standard). This means:

1. Your software must encrypt the request data before sending
2. The API response will be encrypted and must be decrypted by your software
3. You need the shared secret key (`AES_SECRET_KEY`) to encrypt and decrypt

This approach prevents license keys and hardware IDs from being exposed during transit and makes it more difficult for malicious users to reverse engineer the verification process.

## Request Format

All requests must be sent as `text/plain` content type, with the encrypted payload as the body of the request.

### Payload Structure (before encryption)

```json
{
  "licenseKey": "XXXX-XXXX-XXXX-XXXX",
  "hardwareId": "optional-hardware-identifier"
}
```

- `licenseKey` (required): The license key to verify
- `hardwareId` (optional): A unique identifier for the hardware. Required if the license has hardware binding enabled.

## Response Format

The response will be a plain text string containing the AES-encrypted response payload.

### Success Response Payload (after decryption)

```json
{
  "valid": true,
  "licenseKey": "XXXX-XXXX-XXXX-XXXX",
  "username": "John Doe",
  "softwareName": "Your Software",
  "expirationDate": "2025-12-31T23:59:59.999Z",
  "hardwareBindingEnabled": true,
  "status": "active"
}
```

### Error Response Payload (after decryption)

```json
{
  "error": "Error message describing the issue"
}
```

Possible error messages:
- "Invalid license key"
- "License has been revoked"
- "License has expired"
- "License is bound to a different hardware ID"
- "Hardware ID is required for this license"

## Integration Examples

### JavaScript/TypeScript

```javascript
// Using CryptoJS library for encryption/decryption
import CryptoJS from 'crypto-js';

const AES_SECRET_KEY = 'your-aes-secret-key'; // Get from secure config
const API_URL = 'https://yourdomain.com/api/license-verification/verify';

// Function to encrypt data
function encryptData(data) {
  const jsonString = JSON.stringify(data);
  return CryptoJS.AES.encrypt(jsonString, AES_SECRET_KEY).toString();
}

// Function to decrypt response
function decryptData(encryptedData) {
  const bytes = CryptoJS.AES.decrypt(encryptedData, AES_SECRET_KEY);
  const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
  
  if (!decryptedData) {
    throw new Error('Decryption failed');
  }
  
  return JSON.parse(decryptedData);
}

// Function to verify license
async function verifyLicense(licenseKey, hardwareId = null) {
  try {
    // Prepare data payload
    const payload = { licenseKey };
    if (hardwareId) {
      payload.hardwareId = hardwareId;
    }
    
    // Encrypt the payload
    const encryptedPayload = encryptData(payload);
    
    // Send request to the API
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: encryptedPayload,
    });
    
    // Get encrypted response text
    const encryptedResponse = await response.text();
    
    // Decrypt the response
    const result = decryptData(encryptedResponse);
    
    // Check for error
    if (result.error) {
      console.error('License verification failed:', result.error);
      return { valid: false, error: result.error };
    }
    
    // Return successful verification
    return result;
  } catch (error) {
    console.error('License verification error:', error);
    return { valid: false, error: error.message };
  }
}

// Usage example
async function checkLicense() {
  const licenseKey = 'ABCD-1234-EFGH-5678';
  const hardwareId = generateHardwareId(); // Implement a function to generate a unique hardware ID
  
  const result = await verifyLicense(licenseKey, hardwareId);
  
  if (result.valid) {
    console.log('License is valid!');
    console.log('Expires on:', new Date(result.expirationDate).toLocaleDateString());
    // Proceed with software initialization
  } else {
    console.error('License validation failed:', result.error);
    // Show error to user
  }
}

// Example function to generate a hardware ID (implement based on your requirements)
function generateHardwareId() {
  // This should generate a unique ID based on hardware components
  // Example: CPU ID + Disk Serial + MAC Address hash
  // For this example, we'll just return a dummy value
  return 'sample-hardware-id-12345';
}
```

### C# (Using .NET)

```csharp
using System;
using System.Net.Http;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

public class LicenseVerifier
{
    private readonly string _aesKey;
    private readonly string _apiUrl;
    private readonly HttpClient _httpClient;

    public LicenseVerifier(string aesKey, string apiUrl)
    {
        _aesKey = aesKey;
        _apiUrl = apiUrl;
        _httpClient = new HttpClient();
    }

    public async Task<LicenseVerificationResult> VerifyLicenseAsync(string licenseKey, string hardwareId = null)
    {
        try
        {
            // Create the request payload
            var payload = new LicenseVerificationRequest
            {
                LicenseKey = licenseKey,
                HardwareId = hardwareId
            };

            // Encrypt the payload
            var encryptedPayload = EncryptData(payload);

            // Send the request
            var response = await _httpClient.PostAsync(_apiUrl, new StringContent(
                encryptedPayload,
                Encoding.UTF8,
                "text/plain"
            ));

            // Get the encrypted response
            var encryptedResponse = await response.Content.ReadAsStringAsync();

            // Decrypt the response
            var result = DecryptResponse(encryptedResponse);

            return result;
        }
        catch (Exception ex)
        {
            return new LicenseVerificationResult
            {
                Valid = false,
                Error = $"Verification error: {ex.Message}"
            };
        }
    }

    private string EncryptData(LicenseVerificationRequest request)
    {
        var json = JsonSerializer.Serialize(request);
        var keyBytes = Encoding.UTF8.GetBytes(_aesKey);
        
        // Use first 32 bytes of the key (or pad if shorter)
        if (keyBytes.Length != 32)
        {
            Array.Resize(ref keyBytes, 32);
        }
        
        using var aes = Aes.Create();
        aes.Key = keyBytes;
        aes.GenerateIV(); // Generate a random IV
        
        using var encryptor = aes.CreateEncryptor(aes.Key, aes.IV);
        using var ms = new System.IO.MemoryStream();
        
        // Write the IV to the beginning of the stream
        ms.Write(aes.IV, 0, aes.IV.Length);
        
        using (var cs = new CryptoStream(ms, encryptor, CryptoStreamMode.Write))
        {
            using var sw = new System.IO.StreamWriter(cs);
            sw.Write(json);
        }
        
        return Convert.ToBase64String(ms.ToArray());
    }

    private LicenseVerificationResult DecryptResponse(string encryptedResponse)
    {
        try
        {
            var cipherBytes = Convert.FromBase64String(encryptedResponse);
            var keyBytes = Encoding.UTF8.GetBytes(_aesKey);
            
            // Use first 32 bytes of the key (or pad if shorter)
            if (keyBytes.Length != 32)
            {
                Array.Resize(ref keyBytes, 32);
            }
            
            using var aes = Aes.Create();
            aes.Key = keyBytes;
            
            // IV is the first 16 bytes
            byte[] iv = new byte[16];
            Array.Copy(cipherBytes, 0, iv, 0, 16);
            aes.IV = iv;
            
            using var decryptor = aes.CreateDecryptor(aes.Key, aes.IV);
            using var ms = new System.IO.MemoryStream(cipherBytes, 16, cipherBytes.Length - 16);
            using var cs = new CryptoStream(ms, decryptor, CryptoStreamMode.Read);
            using var sr = new System.IO.StreamReader(cs);
            
            var jsonResponse = sr.ReadToEnd();
            return JsonSerializer.Deserialize<LicenseVerificationResult>(jsonResponse, 
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        }
        catch (Exception ex)
        {
            return new LicenseVerificationResult
            {
                Valid = false,
                Error = $"Decryption error: {ex.Message}"
            };
        }
    }

    // Helper classes for serialization
    public class LicenseVerificationRequest
    {
        public string LicenseKey { get; set; }
        public string HardwareId { get; set; }
    }

    public class LicenseVerificationResult
    {
        public bool Valid { get; set; }
        public string LicenseKey { get; set; }
        public string Username { get; set; }
        public string SoftwareName { get; set; }
        public DateTime ExpirationDate { get; set; }
        public bool HardwareBindingEnabled { get; set; }
        public string Status { get; set; }
        public string Error { get; set; }
    }
}

// Usage Example
public class Program
{
    public static async Task Main()
    {
        // Initialize the license verifier
        var verifier = new LicenseVerifier(
            "your-aes-secret-key", 
            "https://yourdomain.com/api/license-verification/verify"
        );
        
        // Generate a hardware ID
        string hardwareId = GenerateHardwareId();
        
        // Verify the license
        var result = await verifier.VerifyLicenseAsync("ABCD-1234-EFGH-5678", hardwareId);
        
        if (result.Valid)
        {
            Console.WriteLine("License is valid!");
            Console.WriteLine($"Expires on: {result.ExpirationDate.ToShortDateString()}");
            // Initialize your software
        }
        else
        {
            Console.WriteLine($"License verification failed: {result.Error}");
            // Show error to user
        }
    }
    
    // Sample hardware ID generator
    private static string GenerateHardwareId()
    {
        // In a real implementation, gather unique hardware identifiers
        // Example: CPU ID, motherboard serial, etc.
        
        // This is a simplified example - implement a proper hardware fingerprinting method
        string machineName = Environment.MachineName;
        string processorId = GetProcessorId(); // Implement this method
        
        // Create a unique hash from the combined values
        using var sha = SHA256.Create();
        var hashBytes = sha.ComputeHash(Encoding.UTF8.GetBytes($"{machineName}|{processorId}"));
        return Convert.ToBase64String(hashBytes);
    }
    
    private static string GetProcessorId()
    {
        // Implement hardware-specific code to get processor ID
        // This would vary depending on the operating system
        return "SAMPLE-PROCESSOR-ID";
    }
}
```

### Python

```python
import json
import base64
import requests
from Cryptodome.Cipher import AES
from Cryptodome.Util.Padding import pad, unpad
import platform
import uuid
import hashlib

class LicenseVerifier:
    def __init__(self, aes_key, api_url):
        self.aes_key = aes_key.encode('utf-8')
        self.api_url = api_url
    
    def encrypt_payload(self, payload):
        # Convert payload to JSON string
        json_payload = json.dumps(payload)
        
        # Create AES cipher in CBC mode
        cipher = AES.new(self.aes_key, AES.MODE_CBC)
        
        # Pad data to be a multiple of block_size
        padded_data = pad(json_payload.encode('utf-8'), AES.block_size)
        
        # Encrypt the data
        encrypted_data = cipher.encrypt(padded_data)
        
        # Combine the IV and encrypted data
        result = cipher.iv + encrypted_data
        
        # Return as base64 string
        return base64.b64encode(result).decode('utf-8')
    
    def decrypt_response(self, encrypted_response):
        # Convert from base64
        encrypted_data = base64.b64decode(encrypted_response)
        
        # Extract the IV (first 16 bytes)
        iv = encrypted_data[:16]
        ciphertext = encrypted_data[16:]
        
        # Create cipher with the extracted IV
        cipher = AES.new(self.aes_key, AES.MODE_CBC, iv)
        
        # Decrypt and unpad
        decrypted_data = unpad(cipher.decrypt(ciphertext), AES.block_size)
        
        # Parse JSON
        return json.loads(decrypted_data.decode('utf-8'))
    
    def verify_license(self, license_key, hardware_id=None):
        try:
            # Prepare payload
            payload = {"licenseKey": license_key}
            if hardware_id:
                payload["hardwareId"] = hardware_id
            
            # Encrypt payload
            encrypted_payload = self.encrypt_payload(payload)
            
            # Send request
            response = requests.post(
                self.api_url,
                data=encrypted_payload,
                headers={"Content-Type": "text/plain"}
            )
            
            # Get encrypted response
            encrypted_response = response.text
            
            # Decrypt response
            result = self.decrypt_response(encrypted_response)
            
            return result
        except Exception as e:
            return {"valid": False, "error": f"Verification error: {str(e)}"}

def generate_hardware_id():
    """Generate a unique hardware identifier."""
    # Collect hardware information
    system_info = platform.system() + platform.version()
    processor = platform.processor()
    machine_id = str(uuid.getnode())  # MAC address as integer
    
    # Combine information and create a hash
    combined = f"{system_info}|{processor}|{machine_id}"
    hardware_id = hashlib.sha256(combined.encode()).hexdigest()
    
    return hardware_id

# Usage example
if __name__ == "__main__":
    # Initialize verifier
    verifier = LicenseVerifier(
        aes_key="your-aes-secret-key",
        api_url="https://yourdomain.com/api/license-verification/verify"
    )
    
    # Generate hardware ID
    hardware_id = generate_hardware_id()
    
    # Verify license
    license_key = "ABCD-1234-EFGH-5678"
    result = verifier.verify_license(license_key, hardware_id)
    
    if result.get("valid"):
        print("License is valid!")
        print(f"Expires on: {result.get('expirationDate')}")
        # Initialize your software
    else:
        print(f"License verification failed: {result.get('error')}")
        # Show error to user
```

## Hardware ID Generation

For hardware-bound licenses, you should generate a unique hardware identifier that remains consistent for a specific device. Here are some approaches for different platforms:

### Windows
- Use WMI to collect hardware information (CPU ID, motherboard serial, disk serial, etc.)
- Hash the combined values to create a stable identifier

### macOS
- Use IOKit to collect hardware serials
- System profiler for hardware information
- Hash the collected values

### Linux
- Read system information from `/proc` and `/sys` directories
- Collect network interface MAC addresses
- Use `dmidecode` to get hardware information

### Cross-platform Approaches
- Use libraries like `node-machine-id` for Node.js
- Combine multiple identifiers (disk serials, network MACs, CPU information)
- Apply a consistent hashing algorithm to maintain stability

## Best Practices

1. **Error Handling**: Always handle potential errors in the license verification process gracefully. Provide clear error messages to users.

2. **Offline Grace Period**: Consider implementing an offline grace period where the software can continue to function for a limited time without verification.

3. **Secure Storage**: Store the AES key securely in your application, using platform-specific methods:
   - Windows: DPAPI or secure registry storage
   - macOS: Keychain
   - Linux: Secret Service API

4. **Obfuscation**: Apply code obfuscation to make it more difficult for attackers to locate and modify the license verification logic.

5. **Anti-Debugging**: Implement basic anti-debugging measures to prevent easy analysis of your verification system.

6. **Periodic Verification**: For software with continuous internet access, periodically re-verify the license rather than only checking at startup.

7. **Fallback Mechanism**: Implement a secondary verification method as a fallback in case the primary mechanism fails.

## Response Status Codes

The API may return the following HTTP status codes:

- **200 OK**: Request was successful (contains either a valid license or an error message in the encrypted response)
- **400 Bad Request**: Malformed request or missing required data
- **500 Internal Server Error**: Server-side error during license verification

Note that all error details are included in the encrypted response body, not in the HTTP status code.

## Security Considerations

- Keep your AES secret key secure and never hardcode it directly in your software.
- Consider using a software protection/obfuscation tool to make reverse engineering more difficult.
- Monitor and limit API request rates to prevent brute force attacks.
- Implement a secure update mechanism to deploy fixes for any security vulnerabilities discovered in your license verification system.