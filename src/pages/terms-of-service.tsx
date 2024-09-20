import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area"

const TermsOfService = () => {
  return (
    <ScrollArea className="h-[400px] w-full rounded-md border p-4">
      <h1 className="text-2xl font-bold mb-4">Terms of Service</h1>
      <p className="mb-4">Last updated: {new Date().toDateString()}</p>
      
      <h2 className="text-xl font-semibold mb-2">1. Acceptance of Terms</h2>
      <p className="mb-4">By accessing or using our Book Search and Management Application, you agree to be bound by these Terms of Service.</p>
      
      <h2 className="text-xl font-semibold mb-2">2. Description of Service</h2>
      <p className="mb-4">Our application provides book search functionality and allows users to manage their personal book collections.</p>
      
      <h2 className="text-xl font-semibold mb-2">3. User Accounts</h2>
      <p className="mb-4">You may be required to create an account to use certain features of our application. You are responsible for maintaining the confidentiality of your account information.</p>
      
      <h2 className="text-xl font-semibold mb-2">4. User Conduct</h2>
      <p className="mb-4">You agree not to use our application for any unlawful purpose or in any way that could damage, disable, overburden, or impair our service.</p>
      
      <h2 className="text-xl font-semibold mb-2">5. Intellectual Property</h2>
      <p className="mb-4">The content, organization, graphics, design, and other matters related to the application are protected under applicable copyrights and other proprietary laws.</p>
      
      <h2 className="text-xl font-semibold mb-2">6. Disclaimer of Warranties</h2>
      <p className="mb-4">Our application is provided "as is" without any warranties, expressed or implied.</p>
      
      <h2 className="text-xl font-semibold mb-2">7. Limitation of Liability</h2>
      <p className="mb-4">We shall not be liable for any indirect, incidental, special, consequential or punitive damages resulting from your use of or inability to use the application.</p>
      
      <h2 className="text-xl font-semibold mb-2">8. Changes to Terms</h2>
      <p className="mb-4">We reserve the right to modify these Terms of Service at any time. We will notify users of any significant changes.</p>
      
      <h2 className="text-xl font-semibold mb-2">9. Contact Information</h2>
      <p className="mb-4">For any questions about these Terms, please contact us at mochamadlutfifadlan@gmail.com.</p>
    </ScrollArea>
  );
};

export default TermsOfService;