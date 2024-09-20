import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area"

const PrivacyPolicy = () => {
  return (
    <ScrollArea className="h-[400px] w-full rounded-md border p-4">
      <h1 className="text-2xl font-bold mb-4">Privacy Policy</h1>
      <p className="mb-4">Last updated: {new Date().toDateString()}</p>
      
      <h2 className="text-xl font-semibold mb-2">1. Introduction</h2>
      <p className="mb-4">Welcome to our Book Search and Management Application. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our application.</p>
      
      <h2 className="text-xl font-semibold mb-2">2. Information We Collect</h2>
      <p className="mb-4">We collect information you provide directly to us, such as when you create an account, search for books, or add books to your collection. This may include your name, email address, and reading preferences.</p>
      
      <h2 className="text-xl font-semibold mb-2">3. How We Use Your Information</h2>
      <p className="mb-4">We use the information we collect to provide, maintain, and improve our services, to communicate with you, and to personalize your experience.</p>
      
      <h2 className="text-xl font-semibold mb-2">4. Sharing of Your Information</h2>
      <p className="mb-4">We do not sell your personal information. We may share your information with third-party service providers that perform services on our behalf, such as hosting and data analysis.</p>
      
      <h2 className="text-xl font-semibold mb-2">5. Data Security</h2>
      <p className="mb-4">We implement appropriate technical and organizational measures to protect the security of your personal information.</p>
      
      <h2 className="text-xl font-semibold mb-2">6. Your Rights</h2>
      <p className="mb-4">You have the right to access, correct, or delete your personal information. You may also have the right to object to or restrict certain processing of your data.</p>
      
      <h2 className="text-xl font-semibold mb-2">7. Changes to This Privacy Policy</h2>
      <p className="mb-4">We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.</p>
      
      <h2 className="text-xl font-semibold mb-2">8. Contact Us</h2>
      <p className="mb-4">If you have any questions about this Privacy Policy, please contact us at mochamadlutfifadlan@gmail.com..</p>
    </ScrollArea>
  );
};

export default PrivacyPolicy;