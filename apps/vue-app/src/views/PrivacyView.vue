<template>
  <div class="max-w-4xl mx-auto">
    <div class="card">
      <h1 class="text-3xl font-bold mb-6">Privacy Policy</h1>
      
      <div class="prose prose-blue max-w-none">
        <p class="text-gray-600 mb-4"><strong>Effective Date:</strong> February 4, 2026</p>

        <h2 class="text-2xl font-bold mt-6 mb-4">1. Information We Collect</h2>
        <p class="mb-4">FileDuck collects minimal information necessary to provide our file sharing service:</p>
        <ul class="list-disc pl-6 mb-4 space-y-2">
          <li>File metadata (filename, size, type)</li>
          <li>SHA-256 checksums for file integrity</li>
          <li>Temporary share codes (automatically deleted after expiration)</li>
          <li>IP addresses for rate limiting and abuse prevention</li>
        </ul>

        <h2 class="text-2xl font-bold mt-6 mb-4">2. How We Use Your Information</h2>
        <ul class="list-disc pl-6 mb-4 space-y-2">
          <li>Malware scanning to protect users</li>
          <li>Rate limiting to prevent abuse</li>
          <li>Analytics to improve service quality</li>
          <li>CAPTCHA verification when necessary</li>
        </ul>

        <h2 class="text-2xl font-bold mt-6 mb-4">3. Third-Party Services</h2>
        <p class="mb-4">We use the following third-party services:</p>
        <ul class="list-disc pl-6 mb-4 space-y-2">
          <li><strong>Google AdSense:</strong> For advertising. See <a href="https://policies.google.com/privacy" class="text-blue-600 hover:underline" target="_blank" rel="noopener">Google's Privacy Policy</a></li>
          <li><strong>Google reCAPTCHA:</strong> For bot protection</li>
          <li><strong>VirusTotal:</strong> For malware scanning</li>
          <li><strong>Cloudflare:</strong> For CDN and DDoS protection</li>
        </ul>

        <h2 class="text-2xl font-bold mt-6 mb-4">4. Cookies and Tracking</h2>
        <p class="mb-4">We use cookies for:</p>
        <ul class="list-disc pl-6 mb-4 space-y-2">
          <li>Session management</li>
          <li>Google AdSense advertising (see <a href="https://policies.google.com/technologies/cookies" class="text-blue-600 hover:underline" target="_blank" rel="noopener">Google's Cookie Policy</a>)</li>
          <li>Analytics</li>
        </ul>
        <p class="mb-4">You can control cookies through your browser settings.</p>

        <h2 class="text-2xl font-bold mt-6 mb-4">5. Data Retention</h2>
        <ul class="list-disc pl-6 mb-4 space-y-2">
          <li>Files: Deleted after expiration (1 hour to 7 days)</li>
          <li>Metadata: Deleted immediately after file deletion</li>
          <li>Share codes: One-time use or expires with file</li>
        </ul>

        <h2 class="text-2xl font-bold mt-6 mb-4">6. Security</h2>
        <p class="mb-4">We implement industry-standard security measures:</p>
        <ul class="list-disc pl-6 mb-4 space-y-2">
          <li>HTTPS encryption for all connections</li>
          <li>Malware scanning (ClamAV + VirusTotal)</li>
          <li>Optional client-side encryption</li>
          <li>Secure, signed CDN URLs</li>
        </ul>

        <h2 class="text-2xl font-bold mt-6 mb-4">7. Your Rights</h2>
        <p class="mb-4">You have the right to:</p>
        <ul class="list-disc pl-6 mb-4 space-y-2">
          <li>Request deletion of your files at any time</li>
          <li>Opt-out of personalized advertising</li>
          <li>Request information about data we've collected</li>
        </ul>

        <h2 class="text-2xl font-bold mt-6 mb-4">8. Children's Privacy</h2>
        <p class="mb-4">FileDuck is not intended for users under 13 years of age. We do not knowingly collect personal information from children.</p>

        <h2 class="text-2xl font-bold mt-6 mb-4">9. Changes to This Policy</h2>
        <p class="mb-4">We may update this policy periodically. The effective date will be updated accordingly.</p>

        <h2 class="text-2xl font-bold mt-6 mb-4">10. Contact Us</h2>
        <p class="mb-4">For privacy-related questions, contact us at: <a href="mailto:privacy@fileduck.app" class="text-blue-600 hover:underline">privacy@fileduck.app</a></p>
      </div>
    </div>

    <div class="mt-6 text-center">
      <router-link to="/" class="text-blue-600 hover:underline">← Back to Home</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
// Privacy Policy page
</script>
