import { Layout } from "@/components/layout/Layout";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const PrivacyPolicy = () => {
  return (
    <Layout>
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 mb-8 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>

            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-8">
              Privacy Policy & Membership Waiver
            </h1>

            {/* Privacy Policy */}
            <section className="mb-12">
              <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                Privacy Policy
              </h2>
              <p className="text-muted-foreground mb-6">Effective Date: 1/01/2024</p>
              
              <p className="text-muted-foreground mb-6">
                USA Grappling Inc. ("we," "us," or "our") values your privacy and is committed to protecting the personal information you share with us through our website, USAGrappling.com ("Website"). This Privacy Policy explains how we collect, use, and safeguard your information. By using our Website, you agree to the terms of this Privacy Policy.
              </p>

              <h3 className="font-display text-xl font-bold text-foreground mb-4 mt-8">
                1. Information We Collect
              </h3>
              <p className="text-muted-foreground mb-4">
                We may collect the following types of information when you visit or interact with our Website:
              </p>
              
              <h4 className="font-semibold text-foreground mb-2">(a) Personal Information</h4>
              <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-1">
                <li>Name</li>
                <li>Email address</li>
                <li>Phone number</li>
                <li>Address</li>
                <li>Payment details (if applicable for purchases or donations)</li>
              </ul>

              <h4 className="font-semibold text-foreground mb-2">(b) Non-Personal Information</h4>
              <ul className="list-disc list-inside text-muted-foreground mb-6 space-y-1">
                <li>Browser type and version</li>
                <li>IP address</li>
                <li>Device type</li>
                <li>Referring website</li>
                <li>Usage data (pages visited, time spent on the site, etc.)</li>
              </ul>

              <h3 className="font-display text-xl font-bold text-foreground mb-4">
                2. How We Use Your Information
              </h3>
              <p className="text-muted-foreground mb-4">
                We use the information we collect for the following purposes:
              </p>
              <ul className="list-disc list-inside text-muted-foreground mb-6 space-y-1">
                <li>To provide and manage our services, including event registrations, memberships, and purchases.</li>
                <li>To communicate with you regarding updates, news, and promotions.</li>
                <li>To personalize and improve your experience on our Website.</li>
                <li>To process transactions securely.</li>
                <li>To comply with legal obligations and protect against unauthorized activities.</li>
              </ul>

              <h3 className="font-display text-xl font-bold text-foreground mb-4">
                3. How We Share Your Information
              </h3>
              <p className="text-muted-foreground mb-4">
                We do not sell or rent your personal information to third parties. However, we may share your information in the following situations:
              </p>
              <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-1">
                <li><strong>Service Providers:</strong> With trusted third-party vendors who assist us in operating our Website and services (e.g., payment processors, email service providers).</li>
                <li><strong>Legal Compliance:</strong> To comply with applicable laws, regulations, or legal processes.</li>
              </ul>
              <p className="text-muted-foreground mb-6">
                No mobile information will be shared with third parties/affiliates for marketing/promotional purposes. All other categories exclude text messaging originator opt-in data and consent; this information will not be shared with any third parties.
              </p>

              <h3 className="font-display text-xl font-bold text-foreground mb-4">
                4. Cookies and Tracking Technologies
              </h3>
              <p className="text-muted-foreground mb-4">
                Our Website uses cookies and similar technologies to improve functionality and user experience. Cookies are small files stored on your device that help us analyze website traffic and tailor content.
              </p>
              <h4 className="font-semibold text-foreground mb-2">(a) Types of Cookies We Use:</h4>
              <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-1">
                <li><strong>Essential Cookies:</strong> Necessary for the basic functionality of the Website.</li>
                <li><strong>Analytics Cookies:</strong> Help us understand how users interact with our Website.</li>
              </ul>
              <p className="text-muted-foreground mb-6">
                You can manage or disable cookies through your browser settings.
              </p>

              <h3 className="font-display text-xl font-bold text-foreground mb-4">
                5. Data Security
              </h3>
              <p className="text-muted-foreground mb-6">
                We implement industry-standard security measures to protect your information from unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet or electronic storage is completely secure. Therefore, we cannot guarantee absolute security.
              </p>

              <h3 className="font-display text-xl font-bold text-foreground mb-4">
                6. Your Rights
              </h3>
              <p className="text-muted-foreground mb-4">
                You have the following rights concerning your personal information:
              </p>
              <ul className="list-disc list-inside text-muted-foreground mb-6 space-y-1">
                <li><strong>Access:</strong> Request a copy of the personal data we hold about you.</li>
                <li><strong>Correction:</strong> Request corrections to inaccurate or incomplete data.</li>
                <li><strong>Deletion:</strong> Request the deletion of your personal information, subject to legal obligations.</li>
                <li><strong>Opt-Out:</strong> Opt-out of receiving marketing communications.</li>
              </ul>

              <h3 className="font-display text-xl font-bold text-foreground mb-4">
                7. Third-Party Links
              </h3>
              <p className="text-muted-foreground mb-6">
                Our Website may contain links to third-party websites. We are not responsible for the privacy practices or content of these external sites. Please review their privacy policies before providing any information.
              </p>

              <h3 className="font-display text-xl font-bold text-foreground mb-4">
                8. Children's Privacy
              </h3>
              <p className="text-muted-foreground mb-6">
                Our Website is not intended for children under the age of 13, and we do not knowingly collect personal information from children. If we learn that we have collected information from a child under 13, we will delete it promptly.
              </p>

              <h3 className="font-display text-xl font-bold text-foreground mb-4">
                9. Changes to This Privacy Policy
              </h3>
              <p className="text-muted-foreground mb-6">
                We reserve the right to update this Privacy Policy at any time. Changes will be effective immediately upon posting on this page. We encourage you to review this Privacy Policy periodically.
              </p>

              <h3 className="font-display text-xl font-bold text-foreground mb-4">
                10. Contact Us
              </h3>
              <p className="text-muted-foreground mb-2">
                If you have any questions about this Privacy Policy or how we handle your information, please contact us:
              </p>
              <ul className="text-muted-foreground mb-6 space-y-1">
                <li><strong>Email:</strong> info@usagrappling.com</li>
                <li><strong>Phone:</strong> 512.886.3151</li>
                <li><strong>Address:</strong> PO Box 931112 Los Angeles, CA 90093</li>
              </ul>
              <p className="text-muted-foreground mb-8">
                Thank you for trusting USA Grappling Inc. with your personal information.
              </p>
            </section>

            {/* Membership Waiver */}
            <section>
              <h2 className="font-display text-2xl font-bold text-foreground mb-6 border-t border-border pt-8">
                USA Grappling Membership Waiver & Code of Conduct
              </h2>

              <h3 className="font-display text-xl font-bold text-foreground mb-4">
                1. Assumption of Risk & Waiver of Liability
              </h3>
              <p className="text-muted-foreground mb-6">
                I acknowledge and fully understand that participation in grappling, jiu-jitsu, wrestling, and other non-striking combat sports involves inherent risks of serious injury, permanent disability, or death. I knowingly and freely assume all risks associated with training, competition, and travel, whether known or unknown. I, for myself and on behalf of my heirs, assigns, and personal representatives, hereby release and hold harmless USA Grappling, its officers, directors, employees, coaches, officials, event organizers, sponsors, volunteers, and venues from any and all liability, claims, demands, or causes of action arising out of participation in any sanctioned activity.
              </p>

              <h3 className="font-display text-xl font-bold text-foreground mb-4">
                2. Medical Treatment & Insurance
              </h3>
              <p className="text-muted-foreground mb-6">
                I authorize USAG officials, medical staff, or emergency personnel to secure necessary medical treatment on my behalf in case of injury or illness. I accept full financial responsibility for such treatment. I acknowledge that USAG does not provide primary medical insurance for members and that I am responsible for maintaining adequate insurance coverage.
              </p>

              <h3 className="font-display text-xl font-bold text-foreground mb-4">
                3. Athlete Code of Conduct
              </h3>
              <p className="text-muted-foreground mb-6">
                I agree to conduct myself in a respectful manner at all times, upholding the values of sportsmanship, integrity, and respect for others. I understand that inappropriate behavior, harassment, or abuse of any kind will not be tolerated and may result in suspension or termination of membership.
              </p>

              <h3 className="font-display text-xl font-bold text-foreground mb-4">
                4. Parent/Guardian Code of Conduct
              </h3>
              <p className="text-muted-foreground mb-4">
                As a parent or guardian of a USAG athlete, I agree to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-1">
                <li>Demonstrate respect for athletes, coaches, referees, event staff, and other parents at all times.</li>
                <li>Refrain from inappropriate language, verbal abuse, harassment, or unsportsmanlike conduct at events.</li>
                <li>Support my child's participation in a positive manner, recognizing that athletic growth is a long-term process.</li>
                <li>Allow coaches and officials to perform their roles without interference.</li>
                <li>Encourage safety, fair play, and respect for all athletes regardless of outcome.</li>
                <li>Comply with USAG's abuse prevention education standards and protect the well-being of all youth athletes.</li>
              </ul>
              <p className="text-muted-foreground mb-6">
                I understand that failure to comply with this Code of Conduct may result in disciplinary action, including removal from events or suspension of my child's membership.
              </p>

              <h3 className="font-display text-xl font-bold text-foreground mb-4">
                5. Abuse Prevention & Protection of Youth
              </h3>
              <p className="text-muted-foreground mb-6">
                USAG is committed to creating a safe environment for all athletes, especially minors. I understand that USAG requires all members, coaches, and parents to uphold the highest standards of behavior and comply with its abuse prevention education policies. Any misconduct, harassment, or inappropriate interaction with youth athletes will result in immediate disciplinary action, up to and including termination of membership and referral to appropriate authorities.
              </p>

              <h3 className="font-display text-xl font-bold text-foreground mb-4">
                6. Anti-Doping Compliance
              </h3>
              <p className="text-muted-foreground mb-6">
                I acknowledge that USAG competitions are subject to national and international anti-doping standards, including those of United World Wrestling (UWW), the U.S. Anti-Doping Agency (USADA), and the World Anti-Doping Agency (WADA). I agree to comply with all such policies and submit to testing if required.
              </p>

              <h3 className="font-display text-xl font-bold text-foreground mb-4">
                7. Media, Broadcast, and Intellectual Property Rights
              </h3>
              <p className="text-muted-foreground mb-4">
                I understand and agree that:
              </p>
              <ul className="list-disc list-inside text-muted-foreground mb-6 space-y-1">
                <li>USAG holds the exclusive worldwide rights to produce, record, distribute, broadcast, livestream, photograph, and otherwise exploit in any media all content created at or derived from USAG-sanctioned events.</li>
                <li>I grant USAG the perpetual right to use my name, image, likeness, voice, and biographical information for promotional, commercial, educational, or marketing purposes related to the mission of USAG, without royalty or compensation.</li>
                <li>All event recordings, broadcasts, livestreams, and photographs are the sole property of USAG. No athlete, coach, academy, or third party may reproduce, stream, or distribute event content without written authorization from USAG.</li>
              </ul>

              <h3 className="font-display text-xl font-bold text-foreground mb-4">
                8. Governing Law & Severability
              </h3>
              <p className="text-muted-foreground mb-6">
                This agreement shall be governed by the laws of the state in which USAG is incorporated. If any provision is found invalid or unenforceable, the remaining provisions shall continue in full force and effect.
              </p>

              <h3 className="font-display text-xl font-bold text-foreground mb-4">
                9. Consent & Acknowledgment
              </h3>
              <p className="text-muted-foreground">
                I have read this waiver and release of liability, fully understand its terms, and agree to be bound by them as a condition of membership in USA Grappling.
              </p>
            </section>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default PrivacyPolicy;
