// src/App.jsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Upload, FileText, Building2, CheckCircle2, AlertCircle, Download, X, Info, HelpCircle, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Type, Save, Trash2, Move, PenTool, RotateCcw, Maximize2, Minimize2, Lock, Unlock, Shield, Clock, Key, Globe, Award, FileCheck } from 'lucide-react';
import * as pdfjsLib from "pdfjs-dist/build/pdf";
import "pdfjs-dist/build/pdf.worker.entry";

// Set worker path
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

// Tutorial Modal Component - MOVED OUTSIDE
const TutorialModal = ({ showTutorial, setShowTutorial, step, fileInputRef }) => {
  const [tutorialStep, setTutorialStep] = useState(0);
  
  const tutorialSteps = [
    {
      title: "Welcome to Signum",
      icon: FileText,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            Signum is a comprehensive document signing platform that supports both electronic and cryptographic digital signatures.
          </p>
          <div className="bg-blue-50 p-3 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-1">Platform Features:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Electronic signature annotations with trusted timestamp</li>
              <li>• Cryptographic digital signatures using company certificates</li>
              <li>• Document finalisation with change restrictions</li>
              <li>• Password protection for sensitive documents</li>
              <li>• Mobile-friendly interface with touch support</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      title: "Electronic Signature Guide",
      icon: PenTool,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            Electronic signatures provide visual annotations with evidentiary timestamps for internal approvals and non-critical documents.
          </p>
          
          <div className="space-y-3">
            <div className="flex items-start">
              <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                1
              </div>
              <div>
                <h5 className="font-medium text-gray-900">Create Your Signature</h5>
                <p className="text-sm text-gray-600">Draw or upload your signature and initials in the tools panel</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                2
              </div>
              <div>
                <h5 className="font-medium text-gray-900">Place Elements</h5>
                <p className="text-sm text-gray-600">Click on the PDF to place signatures, initials, and text annotations</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                3
              </div>
              <div>
                <h5 className="font-medium text-gray-900">Position & Adjust</h5>
                <p className="text-sm text-gray-600">Use the Move tool to drag elements to the correct position</p>
              </div>
            </div>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Electronic signatures provide visual representation and timestamp evidence but do not apply cryptographic document integrity protection.
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Digital Signature (PKI) Guide",
      icon: Award,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            Digital signatures use Public Key Infrastructure (PKI) to cryptographically secure documents, ensuring signer identity and document integrity.
          </p>
          
          <div className="space-y-3">
            <h5 className="font-semibold text-gray-900">Configuration Options:</h5>
            
            <div className="bg-green-50 p-3 rounded-lg">
              <h6 className="font-medium text-green-900 mb-1">Digital Signature with Timestamp</h6>
              <p className="text-sm text-green-800">
                • Cryptographically signs the document using your company certificate<br/>
                • Adds trusted timestamp from a certified authority<br/>
                • Provides evidence of signing time<br/>
                • Document remains editable for additional signatures
              </p>
            </div>
            
            <div className="bg-purple-50 p-3 rounded-lg">
              <h6 className="font-medium text-purple-900 mb-1">Final Digital Signature</h6>
              <p className="text-sm text-purple-800">
                • Applies cryptographic signature and locks the document<br/>
                • Prevents further modifications or additional signatures<br/>
                • Document can still be opened and viewed by anyone<br/>
                • Suitable for final versions and distribution
              </p>
            </div>
            
            <div className="bg-indigo-50 p-3 rounded-lg">
              <h6 className="font-medium text-indigo-900 mb-1">Final Digital Signature with Password Protection</h6>
              <p className="text-sm text-indigo-800">
                • Applies cryptographic signature and locks document<br/>
                • Requires password to open the final document<br/>
                • Restricts access to authorised recipients only<br/>
                • Maximum security for confidential documents
              </p>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>Certificate Requirements:</strong> Digital signatures require a valid company certificate (SSL/TLS certificate) installed on your server. Contact your IT administrator for certificate setup.
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Workflow & Best Practices",
      icon: CheckCircle2,
      content: (
        <div className="space-y-4">
          <div className="space-y-3">
            <h5 className="font-semibold text-gray-900">Recommended Workflow:</h5>
            
            <div className="flex items-start">
              <div className="bg-gray-100 text-gray-600 rounded-full w-6 h-6 flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                <Upload className="w-3 h-3" />
              </div>
              <div>
                <h6 className="font-medium text-gray-900">Step 1: Upload & Review</h6>
                <p className="text-sm text-gray-600">Upload your PDF and review all pages before signing</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                <PenTool className="w-3 h-3" />
              </div>
              <div>
                <h6 className="font-medium text-gray-900">Step 2: Internal Approvals</h6>
                <p className="text-sm text-gray-600">Use electronic signatures for internal reviews and approvals</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-green-100 text-green-600 rounded-full w-6 h-6 flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                <Award className="w-3 h-3" />
              </div>
              <div>
                <h6 className="font-medium text-gray-900">Step 3: Final Signing</h6>
                <p className="text-sm text-gray-600">Apply cryptographic digital signature for final version</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-purple-100 text-purple-600 rounded-full w-6 h-6 flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                <Lock className="w-3 h-3" />
              </div>
              <div>
                <h6 className="font-medium text-gray-900">Step 4: Distribution</h6>
                <p className="text-sm text-gray-600">Finalise with password protection for confidential distribution</p>
              </div>
            </div>
          </div>
          
          <div className="bg-yellow-50 p-3 rounded-lg">
            <h6 className="font-medium text-yellow-900 mb-1">Best Practices:</h6>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• Always preview the document before final signing</li>
              <li>• Use zoom controls for precise signature placement</li>
              <li>• Save electronic signatures for future use</li>
              <li>• Keep digital certificate passwords secure</li>
              <li>• Maintain audit trails for regulatory compliance</li>
            </ul>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-lg">
            <h6 className="font-medium text-gray-900 mb-1">Technical Requirements:</h6>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• PDF files up to 25MB supported</li>
              <li>• Server requires open-sign-pdf.jar for digital signatures</li>
              <li>• Company SSL certificate required for PKI signatures</li>
              <li>• Modern browser with JavaScript enabled</li>
              <li>• Internet connection for timestamp services</li>
            </ul>
          </div>
        </div>
      )
    },
    // Add to tutorialSteps array in TutorialModal component
{
  title: "Legal Framework for Digital Signatures",
  icon: Globe,
  content: (
    <div className="space-y-4">
      <p className="text-gray-700">
        For cross-border B2B agreements, ensure your contracts include these key clauses:
      </p>
      
      <div className="space-y-3">
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
          <h5 className="font-semibold text-blue-900 mb-1">1. Governing Law & Jurisdiction</h5>
          <code className="text-xs text-blue-800 block bg-white p-2 rounded mt-1">
            "This Agreement shall be governed by and construed in accordance with the laws of [Jurisdiction].<br/>
            The Parties irrevocably submit to the exclusive jurisdiction of the courts of [Jurisdiction]."
          </code>
        </div>
        
        <div className="bg-green-50 p-3 rounded-lg border border-green-200">
          <h5 className="font-semibold text-green-900 mb-1">2. Digital Signature Recognition</h5>
          <code className="text-xs text-green-800 block bg-white p-2 rounded mt-1">
            "The Parties agree that electronic signatures and cryptographic digital signatures<br/>
            applied using mutually recognised certificate authorities shall have the same legal<br/>
            effect as handwritten signatures."
          </code>
        </div>
        
        <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
          <h5 className="font-semibold text-purple-900 mb-1">3. Local Law Compliance</h5>
          <code className="text-xs text-purple-800 block bg-white p-2 rounded mt-1">
            "Nothing in this Agreement shall be construed to require either Party to act in<br/>
            violation of mandatory laws or regulations applicable in its jurisdiction."
          </code>
        </div>
      </div>
      
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
        <p className="text-sm text-yellow-800">
          <strong>Key Legal Note:</strong> Digital signatures using company certificates are generally recognized in cross-border B2B transactions under private international law and UNCITRAL principles, provided parties have contractual intent.
        </p>
      </div>
    </div>
  )
}
  ];

  if (!showTutorial) return null;

  const Icon = tutorialSteps[tutorialStep].icon;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
              <Icon className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{tutorialSteps[tutorialStep].title}</h2>
              <p className="text-sm text-gray-600">Step {tutorialStep + 1} of {tutorialSteps.length}</p>
            </div>
          </div>
          <button 
            onClick={() => {
              setShowTutorial(false);
              setTutorialStep(0);
            }} 
            className="text-gray-500 hover:text-gray-700 p-1"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-6">
            {tutorialSteps[tutorialStep].content}
          </div>
          
          {/* Progress Indicator */}
          <div className="flex justify-center space-x-2 mb-6">
            {tutorialSteps.map((_, index) => (
              <button
                key={index}
                onClick={() => setTutorialStep(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === tutorialStep 
                    ? 'bg-blue-600 scale-110' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to step ${index + 1}`}
              />
            ))}
          </div>
        </div>
        
        <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-between">
          <button
            onClick={() => {
              if (tutorialStep > 0) {
                setTutorialStep(tutorialStep - 1);
              } else {
                setShowTutorial(false);
                setTutorialStep(0);
              }
            }}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
          >
            {tutorialStep === 0 ? 'Close' : 'Previous'}
          </button>
          
          <button
            onClick={() => {
              if (tutorialStep < tutorialSteps.length - 1) {
                setTutorialStep(tutorialStep + 1);
              } else {
                setShowTutorial(false);
                setTutorialStep(0);
                if (step === 'upload') {
                  fileInputRef.current?.click();
                }
              }
            }}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            {tutorialStep === tutorialSteps.length - 1 
              ? (step === 'upload' ? 'Upload Document' : 'Start Signing') 
              : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Legal Framework Modal Component
const LegalFrameworkModal = ({ showLegalModal, setShowLegalModal }) => {
  if (!showLegalModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Legal Framework & Terms of Service</h2>
              <p className="text-sm text-gray-600">Global Legal Framework for Electronic & Digital Signatures</p>
            </div>
          </div>
          <button 
            onClick={() => setShowLegalModal(false)} 
            className="text-gray-500 hover:text-gray-700 p-1"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-8">
            {/* Legal Framework Content */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">1. Legal Basis and General Recognition</h3>
              <div className="text-gray-700 space-y-2">
                <p>This platform enables the application of electronic signatures and cryptographic digital signatures in accordance with internationally recognised principles of electronic commerce, including the UNCITRAL Model Law on Electronic Commerce and the UNCITRAL Model Law on Electronic Signatures, as implemented under applicable national laws.</p>
                <p>Electronic and digital signatures applied through this platform shall not be denied legal effect or enforceability solely on the grounds that they are in electronic form, subject to compliance with mandatory local legal requirements.</p>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">2. Signature Types Supported</h3>
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">a. Electronic Signatures</h4>
                  <p className="text-blue-800">Electronic signatures, including drawn, uploaded, or typed signatures, may be used where permitted by applicable electronic commerce legislation. Such signatures evidence the signatory's intent to authenticate the document but do not inherently provide cryptographic integrity protection.</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">b. Cryptographic Digital Signatures (PKI)</h4>
                  <p className="text-green-800">Cryptographic digital signatures applied using valid digital certificates provide enhanced assurance by:</p>
                  <ul className="list-disc pl-5 mt-2 text-green-800 space-y-1">
                    <li>Cryptographically binding the signer to the document</li>
                    <li>Detecting post-signature modification</li>
                    <li>Supporting auditability and non-repudiation</li>
                  </ul>
                  <p className="mt-2 text-green-800">The legal effect of such signatures depends on the certificate framework, trust service provider, and applicable law.</p>
                </div>
              </div>
            </section>

            {/* Add remaining sections here following same pattern */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">3. Contractual Consent and Intent</h3>
              <p className="text-gray-700">By using this platform, parties expressly consent to conduct transactions electronically and agree that electronic and digital signatures may be used to indicate contractual intent, subject to applicable law.</p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">4. Cross-Border and Inter-Company Transactions</h3>
              <p className="text-gray-700">For cross-border or inter-company agreements, parties are strongly advised to include express clauses addressing governing law and jurisdiction, mutual recognition of electronic and digital signatures, and acceptance of certificates issued by recognised or mutually agreed certificate authorities.</p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">5. Jurisdiction-Specific Requirements</h3>
              <p className="text-gray-700">Certain jurisdictions impose additional requirements for specific transaction types or signature assurance levels. Users are responsible for ensuring that the chosen signature method complies with applicable local legal requirements.</p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">6. Government and Statutory Filings</h3>
              <p className="text-gray-700">Submissions to government bodies, courts, or statutory authorities may require digital certificates issued by officially designated or accredited authorities.</p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">7. Evidence and Auditability</h3>
              <p className="text-gray-700">The platform maintains technical records to support evidentiary requirements. The admissibility and evidential weight of such records are determined by applicable law and procedural rules.</p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">8. Stamp Duty and Formalities</h3>
              <p className="text-gray-700">Where applicable, stamp duty, registration, or filing requirements may affect the enforceability of a signed document but do not, in principle, invalidate the formation of the agreement itself, subject to local law.</p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">9. Limitation of Legal Assurance</h3>
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <p className="text-yellow-800"><strong>Important:</strong> This platform provides technical tools for applying electronic and digital signatures but does not provide legal advice. Legal validity and enforceability depend on the nature of the transaction, the parties involved, and applicable laws.</p>
                <p className="mt-2 text-yellow-800">Users should obtain independent legal advice for transactions involving regulatory, statutory, or cross-border legal risk.</p>
              </div>
            </section>

            {/* Terms of Service Section */}
            <section className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Terms of Service</h3>
              <div className="text-gray-700 space-y-3">
                <p>By using this platform, you agree to:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Use the platform in accordance with all applicable laws and regulations</li>
                  <li>Ensure you have the legal authority to sign documents on behalf of yourself or your organization</li>
                  <li>Maintain the confidentiality of your certificate passwords and private keys</li>
                  <li>Verify that electronic or digital signatures are legally acceptable for your specific use case</li>
                  <li>Acknowledge that this is a demonstration application for technical evaluation purposes</li>
                </ul>
              </div>
            </section>
          </div>
        </div>
        
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={() => setShowLegalModal(false)}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Data Privacy Policy Modal Component
const DataPrivacyModal = ({ showPrivacyModal, setShowPrivacyModal }) => {
  if (!showPrivacyModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
              <Shield className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Data Privacy Policy</h2>
              <p className="text-sm text-gray-600">Privacy and Data Handling Information</p>
            </div>
          </div>
          <button 
            onClick={() => setShowPrivacyModal(false)} 
            className="text-gray-500 hover:text-gray-700 p-1"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Data Privacy Content */}
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h3 className="font-semibold text-green-900 mb-2">Important Privacy Notice</h3>
              <p className="text-green-800">
                This is a <strong>static web application</strong> that runs entirely in your browser. 
                We do not collect, store, or transmit any user data to external servers.
              </p>
            </div>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Data Handling Principles</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-gray-100 text-gray-600 rounded-full w-6 h-6 flex items-center justify-center mr-2 flex-shrink-0 mt-1">
                    <Lock className="w-3 h-3" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Local Processing Only</h4>
                    <p className="text-gray-700 text-sm">
                      All document processing, signature creation, and PDF operations occur locally in your browser. 
                      No files or personal data are uploaded to any server.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-gray-100 text-gray-600 rounded-full w-6 h-6 flex items-center justify-center mr-2 flex-shrink-0 mt-1">
                    <Building2 className="w-3 h-3" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Self-Hosted Deployment</h4>
                    <p className="text-gray-700 text-sm">
                      This application is designed to be published at your own domain. 
                      When self-hosted, you control all aspects of data handling and logging.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-gray-100 text-gray-600 rounded-full w-6 h-6 flex items-center justify-center mr-2 flex-shrink-0 mt-1">
                    <FileText className="w-3 h-3" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Audit Logging</h4>
                    <p className="text-gray-700 text-sm">
                      Log collection for audit purposes is based on how you configure nxlog on your server. 
                      No automatic logging occurs within the application itself.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Purpose and Source Code</h3>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-blue-800">
                  This application is a <strong>demonstration platform</strong> for electronic and digital signature technologies. 
                  It is not intended for production use without proper security assessment and compliance verification.
                </p>
                <div className="mt-3">
                  <a 
                    href="https://github.com/KamarularifinAzman/signum" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    View Source Code on GitHub
                  </a>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Contact Information</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 mb-2">For questions about this application:</p>
                <a 
                  href="https://www.linkedin.com/in/kamarularifin-azman/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  Kamarularifin Azman on LinkedIn
                </a>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Security Considerations</h3>
              <div className="text-gray-700 space-y-2">
                <p>When deploying this application:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Ensure proper HTTPS configuration for production use</li>
                  <li>Secure your certificate and private key storage</li>
                  <li>Implement appropriate logging and monitoring</li>
                  <li>Regularly update dependencies for security patches</li>
                  <li>Conduct security assessments before production deployment</li>
                </ul>
              </div>
            </section>
          </div>
        </div>
        
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={() => setShowPrivacyModal(false)}
            className="w-full px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors"
          >
            Close Privacy Policy
          </button>
        </div>
      </div>
    </div>
  );
};

// Copyright Footer Component - MOVED OUTSIDE
// Update CopyrightFooter component to accept props
const CopyrightFooter = ({ onOpenLegal, onOpenPrivacy, onOpenContact }) => (
  <div className="mt-8 pt-6 border-t border-gray-200">
    <div className="text-center text-gray-500 text-sm">
      <div className="flex flex-col md:flex-row items-center justify-center space-y-2 md:space-y-0 md:space-x-6">
        <div>
          &copy; {new Date().getFullYear()} Signum Document Signing Platform. All rights reserved.
        </div>
        <div className="hidden md:block">•</div>
        <div>
          Version 2.1.0 • Built with open-sign-pdf.jar integration
        </div>
        <div className="hidden md:block">•</div>
        <div className="flex items-center justify-center space-x-4">
          <button 
            onClick={onOpenLegal}
            className="text-blue-600 hover:text-blue-800 transition-colors"
          >
            Legal Framework & Terms
          </button>
          <span className="text-gray-400">|</span>
          <button 
            onClick={onOpenPrivacy}
            className="text-blue-600 hover:text-blue-800 transition-colors"
          >
            Privacy Policy
          </button>
          <span className="text-gray-400">|</span>
          <a 
            href="https://github.com/KamarularifinAzman/signum" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 transition-colors"
          >
            Source Code
          </a>
          <span className="text-gray-400">|</span>
          <a 
            href="https://www.linkedin.com/in/kamarularifin-azman/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 transition-colors"
          >
            Contact Support
          </a>
        </div>
      </div>
      <div className="mt-2 text-xs text-gray-400">
        Electronic signatures provided under applicable electronic commerce laws. 
        Digital signatures require valid company certificates. 
        For cross-border B2B agreements, include governing law, jurisdiction, and digital signature recognition clauses.
        Government submissions may require designated authority certificates.
      </div>
      <div className="mt-3 text-xs text-gray-600 bg-gray-50 p-3 rounded max-w-2xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <strong>Application Type:</strong> Static Web App (Client-side only) • 
            <strong> Data Collection:</strong> None • 
            <strong> Deployment:</strong> Self-hosted at your domain
          </div>
          <a 
            href="https://github.com/KamarularifinAzman/signum" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 ml-2"
          >
            View on GitHub
          </a>
        </div>
      </div>
    </div>
  </div>
);

// Main Component
const PDFSignatureApp = () => {
  // In the main component state section, add:
  const [showLegalModal, setShowLegalModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showPrivacyBanner, setShowPrivacyBanner] = useState(true); 

  // State management
  const [step, setStep] = useState('upload');
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfDocument, setPdfDocument] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  
  // Signature/Initial management
  const [signatureImage, setSignatureImage] = useState(null);
  const [initialImage, setInitialImage] = useState(null);
  const [signatureMarks, setSignatureMarks] = useState([]);
  const [activeTool, setActiveTool] = useState('signature');
  
  // Company signature
  const [staffName, setStaffName] = useState('');
  const [staffNumber, setStaffNumber] = useState('');
  const [companyName, setCompanyName] = useState('Your Company');
  const [personalSignedPdf, setPersonalSignedPdf] = useState(null);
  const [companySignedPdf, setCompanySignedPdf] = useState(null);
  
  // UI state
  const [showTutorial, setShowTutorial] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [textInput, setTextInput] = useState('');
  const [selectedMark, setSelectedMark] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  // Digital signature configuration
  const [signatureMode, setSignatureMode] = useState('electronic');
  const [signingReason, setSigningReason] = useState('Document signing and approval');
  const [signingLocation, setSigningLocation] = useState('Corporate Headquarters');
  const [digitalSignatureType, setDigitalSignatureType] = useState('graphical');
  const [digitalSignatureSize, setDigitalSignatureSize] = useState(200);
  const [includeTimestamp, setIncludeTimestamp] = useState(true);
  const [finaliseDocument, setFinaliseDocument] = useState(false);
  const [passwordProtection, setPasswordProtection] = useState(false);
  const [password, setPassword] = useState('');
  const [certificatePath, setCertificatePath] = useState('C:\\xampp\\apache\\conf\\ssl.crt\\fullchain.pem');
  const [privateKeyPath, setPrivateKeyPath] = useState('C:\\xampp\\apache\\conf\\ssl.key\\server.key');

  // Refs for canvas and UI elements
  const pdfContainerRef = useRef(null);
  const canvasRef = useRef(null);
  const signatureCanvasRef = useRef(null);
  const initialCanvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const sidebarRef = useRef(null);

  // Coordinate conversion functions
  const canvasToA4 = (canvasX, canvasY, canvasWidth, canvasHeight) => {
    return {
      x: (canvasX / canvasWidth) * 595,  // A4 width in points
      y: (canvasY / canvasHeight) * 842   // A4 height in points
    };
  };

  const a4ToCanvas = (a4X, a4Y, canvasWidth, canvasHeight) => {
    return {
      x: (a4X / 595) * canvasWidth,
      y: (a4Y / 842) * canvasHeight
    };
  };

  // Handle PDF upload
  const handlePdfUpload = async (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
      setPdfLoading(true);
      setError(null);
      
      try {
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        
        loadingTask.promise.then((pdf) => {
          setPdfDocument(pdf);
          setTotalPages(pdf.numPages);
          setCurrentPage(1);
          
          if (signatureMode === 'pki') {
            setStep('company-sign');
          } else {
            setStep('view-sign');
          }
          
          setPdfLoading(false);
        }).catch((err) => {
          console.error('PDF loading error:', err);
          setError('Failed to load PDF file. Please try again.');
          setPdfLoading(false);
        });
      } catch (err) {
        console.error('Upload error:', err);
        setError('Failed to upload file. Please try again.');
        setPdfLoading(false);
      }
    } else {
      setError('Please upload a valid PDF file (PDF format only)');
    }
  };
// Privacy Banner Component
const PrivacyBanner = ({ showPrivacyBanner, setShowPrivacyBanner, setShowPrivacyModal, setShowLegalModal }) => {
  if (!showPrivacyBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-blue-600 text-white p-3 z-40 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-3 md:mb-0 md:mr-4 flex-1">
            <p className="text-sm">
              <strong>Privacy Notice:</strong> This is a static web app that runs locally in your browser. 
              No user data is collected or transmitted. For audit logs, configure nxlog on your server. 
              <a 
                href="https://github.com/KamarularifinAzman/signum" 
                target="_blank" 
                rel="noopener noreferrer"
                className="underline ml-2"
              >
                View source code
              </a>
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setShowPrivacyModal(true)}
              className="text-sm bg-blue-700 hover:bg-blue-800 px-3 py-1 rounded transition-colors"
            >
              Privacy Policy
            </button>
            <button 
              onClick={() => setShowLegalModal(true)}
              className="text-sm bg-blue-700 hover:bg-blue-800 px-3 py-1 rounded transition-colors"
            >
              Legal Framework
            </button>
            <button 
              onClick={() => setShowPrivacyBanner(false)}
              className="text-sm bg-blue-800 hover:bg-blue-900 px-3 py-1 rounded transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

  // Render signature marks with updated text - MOVED BEFORE useEffect
  const renderSignatureMarks = useCallback((context, viewport) => {
    const currentPageMarks = signatureMarks.filter(mark => mark.page === currentPage);
    
    currentPageMarks.forEach(mark => {
      // Convert A4 coordinates to canvas coordinates
      const canvasX = (mark.x / 595) * viewport.width;
      const canvasY = (mark.y / 842) * viewport.height;
      const canvasWidth = (mark.width / 595) * viewport.width;
      const canvasHeight = (mark.height / 842) * viewport.height;
      
      context.save();
      
      // Draw selection border if selected
      if (selectedMark?.id === mark.id) {
        context.strokeStyle = '#3b82f6';
        context.lineWidth = 2;
        context.setLineDash([5, 5]);
        context.strokeRect(canvasX - 2, canvasY - 2, canvasWidth + 4, canvasHeight + 4);
        context.setLineDash([]);
      }
      
      context.globalAlpha = mark.opacity || 1;
      
      if (mark.type === 'digital') {
        // Draw digital signature box
        context.fillStyle = 'rgba(220, 252, 231, 0.2)';
        context.fillRect(canvasX, canvasY, canvasWidth, canvasHeight);
        
        context.strokeStyle = '#16a34a';
        context.lineWidth = 2;
        context.strokeRect(canvasX, canvasY, canvasWidth, canvasHeight);
        
        // Draw digital signature text
        context.fillStyle = '#15803d';
        context.font = `bold ${12 * (viewport.width / 595)}px Arial`;
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        
        const centerX = canvasX + canvasWidth / 2;
        const centerY = canvasY + canvasHeight / 2;
        
        // Updated text rendering based on recommendations
        if (mark.digitalData?.type === 'text') {
          context.fillText('CRYPTOGRAPHIC DIGITAL SIGNATURE', centerX, centerY - 30);
          context.font = `${10 * (viewport.width / 595)}px Arial`;
          if (mark.digitalData?.staffName) {
            context.fillText(`By: ${mark.digitalData.staffName}`, centerX, centerY - 15);
          }
          if (companyName) {
            context.fillText(`Organisation: ${companyName}`, centerX, centerY);
          }
          context.fillText(`Date: ${new Date().toLocaleDateString()}`, centerX, centerY + 15);
          context.fillText(`Status: Document Integrity Cryptographically Protected`, centerX, centerY + 30);
  context.fillText(`Applicable Law: Contractual Intent Under Chosen Jurisdiction`, centerX, centerY + 45);
}else {
          // Graphical signature with updated text
          context.fillText('Digitally Signed', centerX, centerY - 25);
          context.font = `${10 * (viewport.width / 595)}px Arial`;
          if (mark.digitalData?.staffName) {
            context.fillText(`By: ${mark.digitalData.staffName}`, centerX, centerY - 10);
          }
          if (companyName) {
            context.fillText(`Organisation: ${companyName}`, centerX, centerY + 5);
          }
          context.fillText(`Date: ${new Date().toLocaleDateString()}`, centerX, centerY + 20);
          
          // Show document status if finalised
          if (mark.digitalData?.finaliseDocument) {
            context.font = `bold ${10 * (viewport.width / 595)}px Arial`;
            context.fillText('Document Finalised', centerX, centerY + 35);
          } else {
            context.fillText('Integrity: Protected', centerX, centerY + 35);
          }
        }
      } else if (mark.image) {
        const img = new Image();
        img.onload = () => {
          context.drawImage(img, canvasX, canvasY, canvasWidth, canvasHeight);
        };
        img.src = mark.image;
      } else if (mark.text) {
        context.font = `${mark.fontSize * (viewport.width / 595)}px Arial`;
        context.fillStyle = mark.color || '#000000';
        context.textBaseline = 'top';
        context.fillText(mark.text, canvasX, canvasY);
      }
      
      context.restore();
    });
  }, [signatureMarks, currentPage, selectedMark, companyName]);

  // Render PDF page with proper scaling
  useEffect(() => {
    if (!pdfDocument || !canvasRef.current || currentPage < 1) return;

    const renderPage = async () => {
      try {
        const page = await pdfDocument.getPage(currentPage);
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        
        // Get viewport with zoom
        const viewport = page.getViewport({ scale: zoom });
        
        // Set canvas dimensions matching viewport
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        
        // Clear canvas
        context.clearRect(0, 0, canvas.width, canvas.height);
        
        // Render PDF page
        const renderContext = {
          canvasContext: context,
          viewport: viewport
        };
        
        await page.render(renderContext).promise;
        
        // Render signature marks
        renderSignatureMarks(context, viewport);
      } catch (err) {
        console.error('Page render error:', err);
      }
    };

    renderPage();
  }, [pdfDocument, currentPage, zoom, renderSignatureMarks]);

  // Handle adding marks
  const handleAddMark = (type, canvasX = null, canvasY = null) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let width, height;

    // Set dimensions based on type
    switch(type) {
      case 'signature':
        if (!signatureImage) {
          setError('Please create or upload a signature first');
          return;
        }
        width = 150;
        height = 60;
        break;
      case 'initial':
        if (!initialImage) {
          setError('Please create or upload initials first');
          return;
        }
        width = 80;
        height = 40;
        break;
      case 'text':
        if (!textInput.trim()) {
          setError('Please enter text first');
          return;
        }
        width = 150;
        height = 30;
        break;
      case 'digital':
        if (!staffName || !staffNumber) {
          setError('Please enter staff name and number first');
          return;
        }
        width = 250; // Increased width for new text
        height = 100; // Increased height for new text
        break;
      default:
        width = 150;
        height = 40;
    }

    let positionX, positionY;

    if (canvasX !== null && canvasY !== null) {
      const a4Coords = canvasToA4(canvasX, canvasY, canvas.width, canvas.height);
      positionX = a4Coords.x - (width / 2);
      positionY = a4Coords.y - (height / 2);
    } else {
      positionX = 200;
      positionY = 500;
    }

    // Ensure within bounds
    positionX = Math.max(0, Math.min(595 - width, positionX));
    positionY = Math.max(0, Math.min(842 - height, positionY));

    const newMark = {
      id: Date.now() + Math.random(),
      type,
      page: currentPage,
      x: positionX,
      y: positionY,
      width,
      height,
      image: type === 'signature' ? signatureImage : 
             type === 'initial' ? initialImage : null,
      text: type === 'text' ? textInput : null,
      fontSize: type === 'text' ? 16 : null,
      color: '#000000',
      opacity: 1,
      rotation: 0,
      ...(type === 'digital' && {
        digitalData: {
          staffName,
          staffNumber,
          companyName,
          reason: signingReason,
          location: signingLocation,
          type: digitalSignatureType,
          includeTimestamp,
          finaliseDocument,
          passwordProtection,
          timestamp: new Date().toISOString()
        }
      })
    };

    setSignatureMarks(prev => [...prev, newMark]);
    if (type === 'text') setTextInput('');
    setError(null);
    setSelectedMark(newMark);
    setActiveTool('move');
  };

  const updateMark = useCallback((id, updates) => {
    setSignatureMarks(prev => prev.map(mark => 
      mark.id === id ? { ...mark, ...updates } : mark
    ));
  }, []);

  const removeMark = useCallback((id) => {
    setSignatureMarks(prev => prev.filter(mark => mark.id !== id));
    if (selectedMark?.id === id) setSelectedMark(null);
  }, [selectedMark]);

  const clearAllMarks = () => {
    if (window.confirm('Are you sure you want to remove all signatures?')) {
      setSignatureMarks([]);
      setSelectedMark(null);
    }
  };

  // Handle canvas click
  const handleCanvasClick = (e) => {
    if (!activeTool || activeTool === 'move') return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const canvasX = x * scaleX;
    const canvasY = y * scaleY;
    
    if (activeTool === 'digital') {
      handleAddMark('digital', canvasX, canvasY);
    } else {
      handleAddMark(activeTool, canvasX, canvasY);
    }
  };

  // Handle mark dragging
  const handleMarkMouseDown = (e, mark) => {
    if (activeTool !== 'move') return;
    
    e.stopPropagation();
    e.preventDefault();
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const canvasX = x * scaleX;
    const canvasY = y * scaleY;
    
    const a4Click = canvasToA4(canvasX, canvasY, canvas.width, canvas.height);
    
    setSelectedMark(mark);
    setIsDragging(true);
    setDragOffset({
      x: a4Click.x - mark.x,
      y: a4Click.y - mark.y
    });
  };

  // Handle mouse move for dragging
  const handleMouseMove = useCallback((e) => {
    if (!isDragging || !selectedMark || !canvasRef.current) return;
    
    e.preventDefault();
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const canvasX = x * scaleX;
    const canvasY = y * scaleY;
    
    const a4Coords = canvasToA4(canvasX, canvasY, canvas.width, canvas.height);
    
    const newX = a4Coords.x - dragOffset.x;
    const newY = a4Coords.y - dragOffset.y;
    
    const boundedX = Math.max(0, Math.min(595 - selectedMark.width, newX));
    const boundedY = Math.max(0, Math.min(842 - selectedMark.height, newY));
    
    updateMark(selectedMark.id, { x: boundedX, y: boundedY });
  }, [isDragging, selectedMark, dragOffset, updateMark]);

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
    }
  }, [isDragging]);

  // Signature drawing functions
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPoint, setLastPoint] = useState({ x: 0, y: 0 });

  const startDrawing = (e, canvasType) => {
    if (activeTool !== canvasType) setActiveTool(canvasType);
    
    const canvas = canvasType === 'signature' ? signatureCanvasRef.current : initialCanvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    
    setIsDrawing(true);
    setLastPoint({ x, y });
    
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e, canvasType) => {
    if (!isDrawing) return;
    
    const canvas = canvasType === 'signature' ? signatureCanvasRef.current : initialCanvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    
    const ctx = canvas.getContext('2d');
    ctx.lineTo(x, y);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    
    setLastPoint({ x, y });
  };

  const stopDrawing = (canvasType) => {
    if (!isDrawing) return;
    
    setIsDrawing(false);
    const canvas = canvasType === 'signature' ? signatureCanvasRef.current : initialCanvasRef.current;
    if (!canvas) return;
    
    const dataUrl = canvas.toDataURL('image/png');
    if (canvasType === 'signature') {
      setSignatureImage(dataUrl);
    } else {
      setInitialImage(dataUrl);
    }
  };

  const clearSignatureCanvas = (type) => {
    const canvas = type === 'signature' ? signatureCanvasRef.current : initialCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    
    if (type === 'signature') {
      setSignatureImage(null);
    } else {
      setInitialImage(null);
    }
  };

  const handleImageUpload = (e, type) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = type === 'signature' ? signatureCanvasRef.current : initialCanvasRef.current;
          if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;
            const imgWidth = img.width;
            const imgHeight = img.height;
            
            const scale = Math.min(canvasWidth / imgWidth, canvasHeight / imgHeight);
            const x = (canvasWidth - imgWidth * scale) / 2;
            const y = (canvasHeight - imgHeight * scale) / 2;
            
            ctx.drawImage(img, x, y, imgWidth * scale, imgHeight * scale);
          }
          
          if (type === 'signature') {
            setSignatureImage(event.target.result);
          } else {
            setInitialImage(event.target.result);
          }
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  // Complete electronic signature
  const completeElectronicSignature = async () => {
    if (signatureMarks.length === 0) {
      setError('Please place at least one signature on the document');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // For demo, simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setPersonalSignedPdf({
        timestamp: new Date().toISOString(),
        marks: signatureMarks.length,
        auditTrail: {
          signedBy: 'User',
          timestamp: new Date().toISOString(),
          ipAddress: '127.0.0.1',
          userAgent: navigator.userAgent
        },
        fileName: `electronic_signed_${pdfFile?.name || 'document.pdf'}`,
        status: 'electronic-signature'
      });

      setStep('electronic-complete');
      setSuccess('Electronic signature completed successfully with trusted timestamp for evidentiary purposes.');
    } catch (err) {
      setError(`Failed to complete signature: ${err.message}`);
      console.error('Signature error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Generate open-sign-pdf command with proper wording
  const generateOpenSignPdfCommand = (signatureMark) => {
    const baseCommand = 'java -jar open-sign-pdf.jar';
    const inputFile = `"${pdfFile?.name}"`;
    const outputFile = `"digital_signed_${pdfFile?.name}"`;
    const certificate = `"${certificatePath.replace(/\\/g, '\\\\')}"`;
    const privateKey = `"${privateKeyPath.replace(/\\/g, '\\\\')}"`;
    
    let command = `${baseCommand} \\\n  --input ${inputFile} \\\n  --output ${outputFile} \\\n  --certificate ${certificate} \\\n  --key ${privateKey}`;
    
    // Add position parameters
    command += ` \\\n  --page ${signatureMark.page} \\\n  --position-x ${Math.round(signatureMark.x)} \\\n  --position-y ${Math.round(signatureMark.y)}`;
    
    // Add timestamp if enabled
    if (includeTimestamp) {
      command += ` \\\n  --timestamp`;
    }
    
    // Add encryption options if finalising document
    if (finaliseDocument) {
      command += ` \\\n  --encrypt`;
      
      // Add password if password protection is enabled
      if (passwordProtection && password) {
        command += ` \\\n  --password "${password}"`;
      }
    }
    
    // Add reason and location
    command += ` \\\n  --reason "${signingReason}" \\\n  --location "${signingLocation}"`;
    
    // Add metadata for signer
    command += ` \\\n  --metadata-signer "${staffName}" \\\n  --metadata-company "${companyName}"`;
    
    return command;
  };

  // Complete company digital signature
  const completeCompanyDigitalSignature = async () => {
    if (!staffName || !staffNumber) {
      setError('Please enter your staff name and number');
      return;
    }

    const digitalSignatureExists = signatureMarks.some(mark => mark.type === 'digital');
    if (!digitalSignatureExists) {
      setError('Please place at least one digital signature on the document');
      return;
    }

    if (passwordProtection && !password) {
      setError('Please enter a password for document protection');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Find the digital signature mark
      const digitalSignature = signatureMarks.find(mark => mark.type === 'digital');
      
      // Generate open-sign-pdf command
      const openSignPdfCommand = generateOpenSignPdfCommand(digitalSignature);
      
      console.log('Open Sign PDF Command:', openSignPdfCommand);

      // For demo purposes, simulate the signing process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const statusBanner = finaliseDocument 
        ? (passwordProtection 
          ? 'Status: Finalised document — no further changes permitted'
          : 'Status: Finalised document — further changes restricted')
        : 'Status: Digitally signed — further signatures may be added';
      
      setCompanySignedPdf({
        timestamp: new Date().toISOString(),
        staffName,
        staffNumber,
        companyName,
        openSignPdfCommand,
        configuration: {
          includeTimestamp,
          finaliseDocument,
          passwordProtection,
          certificatePath,
          privateKeyPath
        },
        certificateInfo: {
          subject: 'CN=your-company.com, O=Your Company, C=US',
          issuer: 'Your Certificate Authority',
          validFrom: new Date().toISOString(),
          validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          timestampAuthority: includeTimestamp ? 'Trusted Timestamp Authority' : 'None'
        },
        fileName: `digital_signed_${new Date().toISOString().slice(0,10).replace(/-/g, '')}_${pdfFile?.name || 'document.pdf'}`,
        statusBanner
      });

      setStep('pki-complete');
      setSuccess('Company digital signature successfully applied. Document integrity is cryptographically protected.');
    } catch (err) {
      setError(`Failed to apply company digital signature: ${err.message}`);
      console.error('Company signature error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle download
  const handleDownload = async (type) => {
    try {
      if (type === 'electronic' && personalSignedPdf?.fileName) {
        // Simulate download for electronic signature
        const link = document.createElement('a');
        link.download = personalSignedPdf.fileName;
        
        // Create a dummy PDF file for demo
        const pdfContent = '%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n...';
        const blob = new Blob([pdfContent], { type: 'application/pdf' });
        link.href = URL.createObjectURL(blob);
        link.click();
      } else if (type === 'pki' && companySignedPdf?.fileName) {
        // Show the command that would be executed
        alert(
          `Digital Signature Configuration Applied\n\n` +
          `Status: ${companySignedPdf.statusBanner}\n\n` +
          `Document saved as: ${companySignedPdf.fileName}`
        );
        
        // Simulate download
        const link = document.createElement('a');
        link.download = companySignedPdf.fileName;
        
        // Create a dummy PDF file for demo
        const pdfContent = '%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n...';
        const blob = new Blob([pdfContent], { type: 'application/pdf' });
        link.href = URL.createObjectURL(blob);
        link.click();
      }
    } catch (err) {
      setError('Failed to download file. Please try again.');
      console.error('Download error:', err);
    }
  };

  // Reset application
  const resetApp = () => {
    setPdfFile(null);
    setPdfDocument(null);
    setSignatureMarks([]);
    setSignatureImage(null);
    setInitialImage(null);
    setPersonalSignedPdf(null);
    setCompanySignedPdf(null);
    setStaffName('');
    setStaffNumber('');
    setCurrentPage(1);
    setStep('upload');
    setError(null);
    setSuccess(null);
    setSelectedMark(null);
    setActiveTool('signature');
    setIsFullscreen(false);
    setSignatureMode('electronic');
    setFinaliseDocument(false);
    setPasswordProtection(false);
    setPassword('');
    setSidebarVisible(true);
  };

  // Toggle fullscreen
const toggleFullscreen = () => {
  // Try to find the element with pdf-viewer-container class
  const container = document.querySelector('.pdf-viewer-container');
  const element = container || pdfContainerRef.current?.closest('.pdf-viewer-container');
  
  if (!element) {
    console.warn('Fullscreen container not found');
    return;
  }
  
  if (!document.fullscreenElement) {
    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) {
      element.msRequestFullscreen();
    }
    setIsFullscreen(true);
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
    setIsFullscreen(false);
  }
};

  // Toggle sidebar for mobile
  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  // Add event listeners
  useEffect(() => {
    const handleMouseUpGlobal = () => {
      if (isDragging) {
        setIsDragging(false);
      }
    };

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    const handleKeyPress = (e) => {
      if (e.key === 'Escape' && isFullscreen) {
        toggleFullscreen();
      }
      if (e.key === ' ' && step !== 'upload') {
        e.preventDefault();
        setCurrentPage(prev => Math.min(totalPages, prev + 1));
      }
    };

    document.addEventListener('mouseup', handleMouseUpGlobal);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('keydown', handleKeyPress);

    return () => {
      document.removeEventListener('mouseup', handleMouseUpGlobal);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [isDragging, isFullscreen, step, totalPages, handleMouseMove]);

  // Upload screen with updated wording
  const renderUpload = () => (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="relative inline-block">
              <FileText className="w-20 h-20 text-blue-600" />
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center border-4 border-white">
                <Shield className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="text-left ml-6">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Signum</h1>
              <p className="text-lg text-gray-600">Document Signing Platform</p>
            </div>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Upload your PDF document to begin the signing process with electronic or cryptographic digital signatures.
          </p>
        </div>

        {/* Signature Mode Selection - UPDATED WORDING */}
        <div className="mb-8 bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Signature Type Selection</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setSignatureMode('electronic')}
              className={`p-4 rounded-xl border-2 transition-all text-left ${
                signatureMode === 'electronic'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-blue-300'
              }`}
            >
              <div className="flex items-center mb-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  signatureMode === 'electronic' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  <PenTool className="w-5 h-5" />
                </div>
                <div className="ml-3">
                  <h4 className="font-semibold text-gray-900">Electronic Signature</h4>
                  <p className="text-xs text-gray-500 mt-1">Electronic signature under applicable electronic commerce laws</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Draw or upload a signature image. Add initials, comments, and text annotations.
                Includes trusted timestamp for evidentiary purposes.
              </p>
              <div className="mt-3 text-xs text-gray-500 border-t border-gray-200 pt-2">
                Note: Does not apply cryptographic document integrity protection.
              </div>
            </button>
            
            <button
              onClick={() => setSignatureMode('pki')}
              className={`p-4 rounded-xl border-2 transition-all text-left ${
                signatureMode === 'pki'
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-300 hover:border-green-300'
              }`}
            >
              <div className="flex items-center mb-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  signatureMode === 'pki' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  <Award className="w-5 h-5" />
                </div>
                <div className="ml-3">
                  <h4 className="font-semibold text-gray-900">Company Digital Signature (PKI)</h4>
                  <p className="text-xs text-gray-500 mt-1">Advanced digital signature suitable for inter-company use</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Apply a cryptographic digital signature using a company certificate.
                Ensures signer identity, document integrity, and auditability.
              </p>
              <div className="mt-3 text-xs text-gray-500 border-t border-gray-200 pt-2">
                Acceptance depends on counterparty and jurisdiction.
              </div>
            </button>
          </div>
          
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
  <div className="flex">
    <Info className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
    <div className="text-sm text-blue-800">
      <strong>Legal Framework:</strong> Company-issued digital certificates are recognised for inter-company transactions under private international law and UNCITRAL principles. 
      For cross-border B2B agreements, include governing law, jurisdiction, and digital signature recognition clauses. 
      Government or statutory submissions may require certificates issued by designated authorities.
      <button 
        onClick={() => setShowLegalModal(true)}
        className="ml-2 text-blue-700 underline hover:text-blue-900"
      >
        View full legal framework
      </button>
    </div>
  </div>
</div>

        {/* Upload section */}
        <div className="border-3 border-dashed border-gray-300 rounded-2xl p-8 md:p-16 text-center hover:border-blue-500 transition-all duration-300 bg-gradient-to-br from-gray-50 to-blue-50">
          <div className="relative inline-block mb-4">
            <FileText className="w-20 h-20 md:w-24 md:h-24 text-gray-400" />
            <div className="absolute -bottom-2 -right-2 w-10 h-10 md:w-12 md:h-12 bg-blue-500 rounded-full flex items-center justify-center border-4 border-white">
              <Upload className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">Upload Document</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Drag & drop your PDF file here or click to browse
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handlePdfUpload}
            className="hidden"
            id="pdf-upload"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 md:px-8 md:py-4 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl"
          >
            <Upload className="w-5 h-5 md:w-6 md:h-6 mr-3" />
            Select PDF File
          </button>
          <p className="text-sm text-gray-500 mt-4">Maximum file size: 25MB • Supported: PDF files</p>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => setShowTutorial(true)}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-semibold"
          >
            <HelpCircle className="w-5 h-5 mr-2" />
            How to Sign Documents
          </button>
          <span className="text-gray-400 hidden sm:inline">•</span>
          <button
            onClick={() => {
              const samplePdfUrl = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
              fetch(samplePdfUrl)
                .then(res => res.blob())
                .then(blob => {
                  const file = new File([blob], 'sample-document.pdf', { type: 'application/pdf' });
                  const event = { target: { files: [file] } };
                  handlePdfUpload(event);
                });
            }}
            className="inline-flex items-center text-gray-600 hover:text-gray-800"
          >
            Try Sample Document
          </button>
        </div>

        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start animate-fade-in">
            <AlertCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-red-800">Error</h4>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {(pdfLoading || loading) && (
          <div className="mt-6 flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-3"></div>
            <span className="text-gray-600">
              {pdfLoading ? 'Loading document...' : 'Processing...'}
            </span>
          </div>
        )}
      </div>
    </div>
    </div>
  );

  // Electronic signature interface (previously personal)
  const renderViewAndSign = () => {
    return (
      <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
        {/* Top Navigation Bar */}
        <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between shadow-sm flex-shrink-0">
          <div className="flex items-center space-x-3">
            <button 
              onClick={toggleSidebar}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors md:hidden"
              title="Toggle sidebar"
            >
              {sidebarVisible ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </button>
            <button 
              onClick={resetApp}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors hidden md:flex"
              title="Back to upload"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="max-w-xs md:max-w-md">
              <h2 className="text-lg font-bold text-gray-900 truncate">
                {pdfFile?.name}
              </h2>
              <p className="text-sm text-gray-500">
                {signatureMarks.length} element{signatureMarks.length !== 1 ? 's' : ''} placed • Page {currentPage} of {totalPages}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Mobile Zoom Controls */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setZoom(Math.max(0.25, zoom - 0.25))}
                disabled={zoom <= 0.25}
                className="p-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-sm text-gray-700 px-2">{Math.round(zoom * 100)}%</span>
              <button
                onClick={() => setZoom(Math.min(5, zoom + 0.25))}
                disabled={zoom >= 5}
                className="p-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>
            
            {/* Desktop Zoom Controls */}
            <div className="hidden md:flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setZoom(Math.max(0.25, zoom - 0.25))}
                disabled={zoom <= 0.25}
                className="p-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoom(1)}
                className="px-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                {Math.round(zoom * 100)}%
              </button>
              <button
                onClick={() => setZoom(Math.min(5, zoom + 0.25))}
                disabled={zoom >= 5}
                className="p-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>
            
            <button
              onClick={toggleFullscreen}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            
            <button
              onClick={() => setShowTutorial(true)}
              className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg"
              title="Help"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden pdf-viewer-container">
          {/* Left Sidebar - Mobile responsive */}
          <div 
            className={`${sidebarVisible ? 'flex' : 'hidden'} md:flex w-full md:w-96 bg-white border-r border-gray-200 flex-col absolute md:relative z-10 h-full`}
            style={{ 
              maxWidth: sidebarVisible ? '100%' : '0', 
              transition: 'max-width 0.3s ease-in-out',
              width: '100%',
              maxWidth: '24rem'
            }}
            >
            <div className="p-4 border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Electronic Signature</h3>
                  <p className="text-sm text-gray-600">Add signature images, initials, and annotations</p>
                </div>
                <button 
                  onClick={toggleSidebar}
                  className="md:hidden p-2 text-gray-600 hover:text-gray-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              {/* Tool Selection */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Tools</h4>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'signature', label: 'Signature', icon: PenTool, color: 'blue' },
                    { id: 'initial', label: 'Initial', icon: Type, color: 'green' },
                    { id: 'text', label: 'Text', icon: Type, color: 'purple' },
                    { id: 'move', label: 'Move', icon: Move, color: 'gray' },
                  ].map(tool => {
                    const Icon = tool.icon;
                    const isActive = activeTool === tool.id;
                    return (
                      <button
                        key={tool.id}
                        onClick={() => {
                          setActiveTool(tool.id);
                          if (tool.id === 'move' && selectedMark) {
                            setSuccess('Click and drag elements to move them');
                          }
                        }}
                        className={`flex flex-col items-center p-2 rounded-lg border-2 transition-all ${
                          isActive 
                            ? `border-${tool.color}-500 bg-${tool.color}-50` 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Icon className={`w-4 h-4 mb-1 ${
                          isActive ? `text-${tool.color}-600` : 'text-gray-500'
                        }`} />
                        <span className={`text-xs font-medium ${
                          isActive ? `text-${tool.color}-700` : 'text-gray-600'
                        }`}>
                          {tool.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Signature Creation */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Your Signature</label>
                  {signatureImage && (
                    <button 
                      onClick={() => clearSignatureCanvas('signature')}
                      className="text-xs text-red-600 hover:text-red-700"
                    >
                      Clear
                    </button>
                  )}
                </div>
                
                <div className="border-2 border-gray-300 rounded-lg overflow-hidden bg-white">
                  <canvas
                    ref={signatureCanvasRef}
                    width={400}
                    height={150}
                    onMouseDown={(e) => startDrawing(e, 'signature')}
                    onMouseMove={(e) => draw(e, 'signature')}
                    onMouseUp={() => stopDrawing('signature')}
                    onMouseLeave={() => stopDrawing('signature')}
                    onTouchStart={(e) => {
                      e.preventDefault();
                      const touch = e.touches[0];
                      const fakeEvent = { clientX: touch.clientX, clientY: touch.clientY };
                      startDrawing(fakeEvent, 'signature');
                    }}
                    onTouchMove={(e) => {
                      e.preventDefault();
                      const touch = e.touches[0];
                      const fakeEvent = { clientX: touch.clientX, clientY: touch.clientY };
                      draw(fakeEvent, 'signature');
                    }}
                    onTouchEnd={() => stopDrawing('signature')}
                    className="w-full h-32 cursor-crosshair touch-none"
                  />
                </div>
                <div className="mt-2 flex justify-between">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'signature')}
                    className="hidden"
                    id="signature-upload"
                  />
                  <label 
                    htmlFor="signature-upload"
                    className="text-xs text-blue-600 hover:text-blue-700 cursor-pointer px-2 py-1 rounded hover:bg-blue-50"
                  >
                    Upload image
                  </label>
                  <button
                    onClick={() => {
                      if (signatureImage) {
                        setActiveTool('signature');
                        setSuccess('Click on PDF to place your signature');
                      } else {
                        setError('Please create or upload a signature first');
                      }
                    }}
                    className={`text-xs px-2 py-1 rounded ${
                      activeTool === 'signature' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                    }`}
                  >
                    Use
                  </button>
                </div>
              </div>

              {/* Initials Creation */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Your Initials</label>
                  {initialImage && (
                    <button 
                      onClick={() => clearSignatureCanvas('initial')}
                      className="text-xs text-red-600 hover:text-red-700"
                    >
                      Clear
                    </button>
                  )}
                </div>
                
                <div className="border-2 border-gray-300 rounded-lg overflow-hidden bg-white">
                  <canvas
                    ref={initialCanvasRef}
                    width={300}
                    height={120}
                    onMouseDown={(e) => startDrawing(e, 'initial')}
                    onMouseMove={(e) => draw(e, 'initial')}
                    onMouseUp={() => stopDrawing('initial')}
                    onMouseLeave={() => stopDrawing('initial')}
                    onTouchStart={(e) => {
                      e.preventDefault();
                      const touch = e.touches[0];
                      const fakeEvent = { clientX: touch.clientX, clientY: touch.clientY };
                      startDrawing(fakeEvent, 'initial');
                    }}
                    onTouchMove={(e) => {
                      e.preventDefault();
                      const touch = e.touches[0];
                      const fakeEvent = { clientX: touch.clientX, clientY: touch.clientY };
                      draw(fakeEvent, 'initial');
                    }}
                    onTouchEnd={() => stopDrawing('initial')}
                    className="w-full h-24 cursor-crosshair touch-none"
                  />
                </div>
                <div className="mt-2 flex justify-between">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'initial')}
                    className="hidden"
                    id="initial-upload"
                  />
                  <label 
                    htmlFor="initial-upload"
                    className="text-xs text-blue-600 hover:text-blue-700 cursor-pointer px-2 py-1 rounded hover:bg-blue-50"
                  >
                    Upload image
                  </label>
                  <button
                    onClick={() => {
                      if (initialImage) {
                        setActiveTool('initial');
                        setSuccess('Click on PDF to place your initials');
                      } else {
                        setError('Please create or upload initials first');
                      }
                    }}
                    className={`text-xs px-2 py-1 rounded ${
                      activeTool === 'initial' 
                        ? 'bg-green-100 text-green-700' 
                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                    }`}
                  >
                    Use
                  </button>
                </div>
              </div>

              {/* Text Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Text Annotation
                </label>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="Enter text to add..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setTextInput('')}
                      className="flex-1 px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
                    >
                      Clear
                    </button>
                    <button
                      onClick={() => {
                        if (textInput.trim()) {
                          setActiveTool('text');
                          setSuccess('Click on PDF to place text annotation');
                        }
                      }}
                      disabled={!textInput.trim()}
                      className="flex-1 bg-purple-600 text-white px-3 py-1.5 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      Ready
                    </button>
                  </div>
                </div>
              </div>

              {/* Placed Elements List */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-gray-900">
                    Placed Elements ({signatureMarks.length})
                  </h4>
                  {signatureMarks.length > 0 && (
                    <button
                      onClick={clearAllMarks}
                      className="text-xs text-red-600 hover:text-red-700"
                    >
                      Clear All
                    </button>
                  )}
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {signatureMarks.map((mark) => (
                    <div 
                      key={mark.id}
                      className={`flex items-center justify-between p-2 rounded cursor-pointer ${
                        selectedMark?.id === mark.id ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                      onClick={() => {
                        setSelectedMark(mark);
                        setActiveTool('move');
                        if (mark.page !== currentPage) {
                          setCurrentPage(mark.page);
                        }
                      }}
                    >
                      <div className="flex items-center space-x-2">
                        <div className={`w-6 h-6 rounded flex items-center justify-center ${
                          mark.type === 'signature' ? 'bg-blue-100 text-blue-600' :
                          mark.type === 'initial' ? 'bg-green-100 text-green-600' :
                          mark.type === 'digital' ? 'bg-green-100 text-green-600' :
                          'bg-purple-100 text-purple-600'
                        }`}>
                          {mark.type === 'signature' ? 'S' : 
                           mark.type === 'initial' ? 'I' : 
                           mark.type === 'digital' ? 'D' : 'T'}
                        </div>
                        <span className="text-sm text-gray-700">
                          {mark.type} - Page {mark.page}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeMark(mark.id);
                        }}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={completeElectronicSignature}
                  disabled={loading || signatureMarks.length === 0}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Applying Electronic Signature...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Apply Electronic Signature
                    </span>
                  )}
                </button>

                <button
                  onClick={() => {
                    setStep('company-sign');
                    setSuccess('Switching to cryptographic digital signature mode');
                  }}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-3 rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-300"
                >
                  <Award className="w-4 h-4 mr-2 inline" />
                  Switch to Digital Signature (PKI)
                </button>
              </div>

              {error && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex">
                    <AlertCircle className="w-4 h-4 text-red-600 mr-2 flex-shrink-0" />
                    <span className="text-sm text-red-800">{error}</span>
                  </div>
                </div>
              )}

              {success && (
                <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                    <span className="text-sm text-green-800">{success}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Main PDF Viewer */}
          <div className="flex-1 flex flex-col bg-gray-100 overflow-hidden relative">
            {/* Mobile sidebar toggle button */}
            {!sidebarVisible && (
              <button
                onClick={toggleSidebar}
                className="absolute top-4 left-4 z-20 md:hidden bg-white p-2 rounded-lg shadow-lg text-gray-700 hover:text-gray-900"
                title="Show tools"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            )}

            {/* Page Controls */}
            <div className="bg-white border-b border-gray-200 p-3 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <div className="flex items-center bg-gray-100 rounded-lg px-3 py-1">
                    <span className="text-sm font-medium text-gray-700">
                      Page <span className="font-bold">{currentPage}</span> of {totalPages}
                    </span>
                  </div>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 hidden md:inline">
                    <span className="font-medium">Tool:</span>{' '}
                    <span className="text-gray-800">
                      {activeTool ? 
                        activeTool.charAt(0).toUpperCase() + activeTool.slice(1) : 
                        'Select a tool'}
                    </span>
                  </span>
                  <button
                    onClick={() => {
                      if (pdfFile) {
                        const link = document.createElement('a');
                        link.download = pdfFile.name;
                        link.href = URL.createObjectURL(pdfFile);
                        link.click();
                      }
                    }}
                    className="flex items-center px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                  >
                    <Download className="w-3 h-3 mr-1" />
                    Original
                  </button>
                </div>
              </div>
            </div>

            {/* PDF Viewer Container */}
            <div 
              ref={pdfContainerRef}
              className="flex-1 overflow-auto p-2 md:p-8 flex items-center justify-center bg-gray-800"
              onClick={handleCanvasClick}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={(e) => {
                if (activeTool === 'digital') {
                  e.preventDefault();
                  const touch = e.touches[0];
                  const fakeEvent = { clientX: touch.clientX, clientY: touch.clientY };
                  handleCanvasClick(fakeEvent);
                }
              }}
            >
              {pdfDocument ? (
                <div className="relative">
                  <canvas
                    ref={canvasRef}
                    onMouseDown={(e) => {
                      // Check if clicking on a mark
                      const canvas = canvasRef.current;
                      if (!canvas || activeTool !== 'move') return;
                      
                      const rect = canvas.getBoundingClientRect();
                      const x = e.clientX - rect.left;
                      const y = e.clientY - rect.top;
                      
                      const scaleX = canvas.width / rect.width;
                      const scaleY = canvas.height / rect.height;
                      const canvasX = x * scaleX;
                      const canvasY = y * scaleY;
                      
                      const a4Coords = canvasToA4(canvasX, canvasY, canvas.width, canvas.height);
                      
                      // Find clicked mark
                      const currentPageMarks = signatureMarks.filter(m => m.page === currentPage);
                      const mark = currentPageMarks.find(m => 
                        a4Coords.x >= m.x && a4Coords.x <= m.x + m.width &&
                        a4Coords.y >= m.y && a4Coords.y <= m.y + m.height
                      );
                      
                      if (mark) {
                        handleMarkMouseDown(e, mark);
                      }
                    }}
                    onTouchStart={(e) => {
                      if (activeTool !== 'move') return;
                      
                      e.preventDefault();
                      const canvas = canvasRef.current;
                      if (!canvas) return;
                      
                      const touch = e.touches[0];
                      const rect = canvas.getBoundingClientRect();
                      const x = touch.clientX - rect.left;
                      const y = touch.clientY - rect.top;
                      
                      const scaleX = canvas.width / rect.width;
                      const scaleY = canvas.height / rect.height;
                      const canvasX = x * scaleX;
                      const canvasY = y * scaleY;
                      
                      const a4Coords = canvasToA4(canvasX, canvasY, canvas.width, canvas.height);
                      const currentPageMarks = signatureMarks.filter(m => m.page === currentPage);
                      const mark = currentPageMarks.find(m => 
                        a4Coords.x >= m.x && a4Coords.x <= m.x + m.width &&
                        a4Coords.y >= m.y && a4Coords.y <= m.y + m.height
                      );
                      
                      if (mark) {
                        const fakeEvent = { clientX: touch.clientX, clientY: touch.clientY };
                        handleMarkMouseDown(fakeEvent, mark);
                      }
                    }}
                    className="bg-white shadow-2xl"
                    style={{
                      cursor: isDragging ? 'grabbing' : 
                              activeTool === 'move' ? 'grab' : 'crosshair',
                      // maxWidth: '100%',
                      // maxHeight: 'calc(100vh - 180px)',
                      touchAction: 'none'
                    }}
                  />
                </div>
              ) : (
                <div className="text-center text-gray-400">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-lg">Loading PDF document...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

    // Company digital signature placement component with updated wording
  const renderCompanySign = () => {
    return (
      <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
        {/* Top Navigation */}
        <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between shadow-sm flex-shrink-0">
          <div className="flex items-center space-x-3">
            <button 
              onClick={toggleSidebar}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors md:hidden"
              title="Toggle sidebar"
            >
              {sidebarVisible ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </button>
            <button 
              onClick={() => {
                if (signatureMode === 'electronic' && signatureMarks.length > 0) {
                  setStep('view-sign');
                } else {
                  setStep('upload');
                }
              }}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors hidden md:flex"
              title="Back"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="max-w-xs md:max-w-md">
              <h2 className="text-lg font-bold text-gray-900 truncate">
                {pdfFile?.name}
              </h2>
              <p className="text-sm text-gray-500">
                Company Digital Signature (PKI) Configuration
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Mobile Zoom Controls */}
            <div className="md:hidden flex items-center bg-gray-100 rounded-lg p-1">
  <button
    onClick={() => setZoom(prev => Math.max(0.25, prev - 0.25))}
    disabled={zoom <= 0.25}
    className="p-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
  >
    <ZoomOut className="w-4 h-4" />
  </button>
  <span className="px-2 text-sm font-medium text-gray-700">
    {Math.round(zoom * 100)}%
  </span>
  <button
    onClick={() => setZoom(prev => Math.min(5, prev + 0.25))}
    disabled={zoom >= 5}
    className="p-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
  >
    <ZoomIn className="w-4 h-4" />
  </button>
</div>
            
            {/* Desktop Zoom Controls */}
            <div className="hidden md:flex items-center bg-gray-100 rounded-lg p-1">
              <button
              onClick={() => setZoom(Math.min(5, zoom + 0.25))}
              disabled={zoom <= 0.25}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
              >
                <ZoomOut className="w-4 h-4" />
                </button>
                <button
                onClick={() => setZoom(1)}
                className="px-3 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-200 rounded"
                >
                  {Math.round(zoom * 100)}%
                  </button>
                  <button
                  onClick={() => setZoom(Math.min(5, zoom + 0.25))}
                  disabled={zoom >= 5}
                  className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                  >
                    <ZoomIn className="w-4 h-4" />
                    </button>
                    </div>
            
            <button
              onClick={toggleFullscreen}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            
            <button
              onClick={() => setShowTutorial(true)}
              className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg"
              title="Help"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden pdf-viewer-container">
          {/* Left Sidebar - Mobile responsive */}
          <div 
            className={`${sidebarVisible ? 'flex' : 'hidden'} md:flex w-full md:w-96 bg-white border-r border-gray-200 flex-col absolute md:relative z-10 h-full`}
            style={{ 
              maxWidth: sidebarVisible ? '100%' : '0', 
              transition: 'max-width 0.3s ease-in-out',
              width: '100%',
              maxWidth: '24rem'
            }}
            >
            <div className="h-full flex flex-col">
              <div className="p-4 border-b border-gray-200 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Digital Signature (PKI)</h3>
                    <p className="text-sm text-gray-600">Configure cryptographic digital signature</p>
                  </div>
                  <button 
                    onClick={toggleSidebar}
                    className="md:hidden p-2 text-gray-600 hover:text-gray-800"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div className="flex-1 min-h-0 overflow-y-auto p-4">
                {/* Staff Details Form */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Signer Information</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Staff Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={staffName}
                        onChange={(e) => setStaffName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Enter your full name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Staff Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={staffNumber}
                        onChange={(e) => setStaffNumber(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Enter your staff number"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Company Name
                      </label>
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Your organisation name"
                      />
                    </div>
                  </div>
                </div>

                {/* Digital Signature Options with updated wording */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Digital Signature Configurations</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Signing Reason</label>
                      <input
                        type="text"
                        value={signingReason}
                        onChange={(e) => setSigningReason(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="e.g., Document approval"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Location</label>
                      <input
                        type="text"
                        value={signingLocation}
                        onChange={(e) => setSigningLocation(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="e.g., Corporate Headquarters"
                      />
                    </div>
                    
                    {/* Timestamp Option */}
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 text-blue-600 mr-2" />
                        <div>
                          <span className="text-sm font-medium text-gray-900">Trusted Timestamp</span>
                          <p className="text-xs text-gray-600">Record trusted signing time</p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={includeTimestamp}
                        onChange={(e) => setIncludeTimestamp(e.target.checked)}
                        className="h-4 w-4 text-green-600 rounded focus:ring-green-500"
                      />
                    </div>
                    
                    {/* Finalise Document Option */}
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <div className="flex items-center">
                        <FileCheck className="w-4 h-4 text-purple-600 mr-2" />
                        <div>
                          <span className="text-sm font-medium text-gray-900">Finalise Document</span>
                          <p className="text-xs text-gray-600">Lock document after signing to prevent further modifications</p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={finaliseDocument}
                        onChange={(e) => {
                          setFinaliseDocument(e.target.checked);
                          if (!e.target.checked) {
                            setPasswordProtection(false);
                            setPassword('');
                          }
                        }}
                        className="h-4 w-4 text-purple-600 rounded focus:ring-purple-500"
                      />
                    </div>
                    
                    {/* Password Protection Option (only shown when finaliseDocument is true) */}
                    {finaliseDocument && (
                      <div className="space-y-3 ml-4 pl-4 border-l-2 border-purple-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Key className="w-4 h-4 text-purple-600 mr-2" />
                            <div>
                              <span className="text-sm font-medium text-gray-900">Password Protection (Optional)</span>
                              <p className="text-xs text-gray-600">Require password to open the final document</p>
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            checked={passwordProtection}
                            onChange={(e) => {
                              setPasswordProtection(e.target.checked);
                              if (!e.target.checked) {
                                setPassword('');
                              }
                            }}
                            className="h-4 w-4 text-purple-600 rounded focus:ring-purple-500"
                          />
                        </div>
                        
                        {passwordProtection && (
                          <div>
                            <label className="block text-sm text-gray-700 mb-1">
                              Document Password <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="password"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              placeholder="Enter password to open the PDF"
                            />
                            <p className="text-xs text-gray-500 mt-1">This password will be required to open the final document</p>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Configuration Summary */}
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <h5 className="text-xs font-semibold text-gray-700 mb-2">Selected Configuration:</h5>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {includeTimestamp && (
                          <li className="flex items-start">
                            <CheckCircle2 className="w-3 h-3 text-green-500 mr-1 mt-0.5 flex-shrink-0" />
                            <span>Digital Signature with Timestamp – Cryptographically signs the document and records trusted signing time</span>
                          </li>
                        )}
                        {finaliseDocument && !passwordProtection && (
                          <li className="flex items-start">
                            <CheckCircle2 className="w-3 h-3 text-green-500 mr-1 mt-0.5 flex-shrink-0" />
                            <span>Final Digital Signature – Signs and locks the document to prevent further changes</span>
                          </li>
                        )}
                        {finaliseDocument && passwordProtection && (
                          <li className="flex items-start">
                            <CheckCircle2 className="w-3 h-3 text-green-500 mr-1 mt-0.5 flex-shrink-0" />
                            <span>Final Digital Signature with Password Protection – Locks and restricts access to authorised recipients</span>
                          </li>
                        )}
                      </ul>
                    </div>
                    
                    {/* Certificate Paths */}
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <h5 className="text-xs font-semibold text-gray-700 mb-2">Certificate Configuration</h5>
                      <div className="space-y-2">
                        <div>
                          <label className="block text-xs text-gray-600">Certificate Path:</label>
                          <code className="text-xs bg-gray-100 p-1 rounded block truncate">
                            {certificatePath}
                          </code>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600">Private Key Path:</label>
                          <code className="text-xs bg-gray-100 p-1 rounded block truncate">
                            {privateKeyPath}
                          </code>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                          <div className="mt-4 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
  <div className="flex items-center justify-between mb-2">
    <h5 className="text-sm font-semibold text-indigo-900 flex items-center">
      Legal Framework Information
    </h5>
    <div className="space-x-2">
      <button 
        onClick={() => setShowTutorial(true)}
        className="text-xs text-indigo-600 hover:text-indigo-800"
      >
        Tutorial
      </button>
      <button 
        onClick={() => setShowLegalModal(true)}
        className="text-xs text-indigo-600 hover:text-indigo-800"
      >
        Full Legal Info
      </button>
    </div>
  </div>
  
  <div className="space-y-2 text-xs text-indigo-800">
    <div className="flex items-start">
      <CheckCircle2 className="w-3 h-3 text-indigo-600 mr-1 mt-0.5 flex-shrink-0" />
      <span>Cross-border B2B contracts can include clauses recognizing company certificate digital signatures</span>
    </div>
    <div className="flex items-start">
      <CheckCircle2 className="w-3 h-3 text-indigo-600 mr-1 mt-0.5 flex-shrink-0" />
      <span>Courts focus on contractual intent, identity attribution, and document integrity</span>
    </div>
    <div className="flex items-start">
      <CheckCircle2 className="w-3 h-3 text-indigo-600 mr-1 mt-0.5 flex-shrink-0" />
      <span>Stamp duty affects admissibility and enforcement, not contract formation</span>
    </div>
  </div>
  
  <div className="mt-3 pt-3 border-t border-indigo-200">
    <details className="text-xs">
      <summary className="text-indigo-700 font-medium cursor-pointer hover:text-indigo-900">
        Recommended Contract Clauses
      </summary>
      <div className="mt-2 space-y-2 text-gray-700">
        <div>
          <strong className="text-xs">Governing Law:</strong>
          <p className="text-xs mt-1 bg-white p-2 rounded">
            "This Agreement shall be governed by and construed in accordance with the laws of [Jurisdiction]."
          </p>
        </div>
        <div>
          <strong className="text-xs">Digital Signature Clause:</strong>
          <p className="text-xs mt-1 bg-white p-2 rounded">
            "The Parties agree that electronic signatures and cryptographic digital signatures shall have the same legal effect as handwritten signatures."
          </p>
        </div>
      </div>
    </details>
  </div>
</div>
                {/* Place Signature Button */}
                <div className="mb-6">
                  <button
                    onClick={() => {
                      if (!staffName || !staffNumber) {
                        setError('Please enter staff name and number');
                        return;
                      }
                      if (passwordProtection && !password) {
                        setError('Please enter a password for document protection');
                        return;
                      }
                      setActiveTool('digital');
                      setSuccess('Click on the PDF where you want to place the digital signature');
                    }}
                    disabled={!staffName || !staffNumber || (passwordProtection && !password)}
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-3 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-300"
                  >
                    <Award className="w-4 h-4 inline mr-2" />
                    Place Digital Signature
                  </button>
                  <p className="text-xs text-gray-500 mt-2">
                    Click this button, then click on the PDF to place the signature
                  </p>
                </div>

                {/* Placed Digital Signatures List */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-gray-900">
                      Digital Signatures ({signatureMarks.filter(m => m.type === 'digital').length})
                    </h4>
                    {signatureMarks.filter(m => m.type === 'digital').length > 0 && (
                      <button
                        onClick={() => {
                          const digitalMarks = signatureMarks.filter(m => m.type === 'digital');
                          if (window.confirm(`Are you sure you want to remove ${digitalMarks.length} digital signature(s)?`)) {
                            setSignatureMarks(prev => prev.filter(m => m.type !== 'digital'));
                            if (selectedMark?.type === 'digital') setSelectedMark(null);
                          }
                        }}
                        className="text-xs text-red-600 hover:text-red-700"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {signatureMarks
                      .filter(mark => mark.type === 'digital')
                      .map((mark) => (
                        <div 
                          key={mark.id}
                          className={`flex items-center justify-between p-2 rounded cursor-pointer ${
                            selectedMark?.id === mark.id ? 'bg-green-50 border border-green-200' : 'bg-gray-50 hover:bg-gray-100'
                          }`}
                          onClick={() => {
                            setSelectedMark(mark);
                            setActiveTool('move');
                            if (mark.page !== currentPage) {
                              setCurrentPage(mark.page);
                            }
                          }}
                        >
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 rounded bg-green-100 text-green-600 flex items-center justify-center">
                              <Award className="w-3 h-3" />
                            </div>
                            <div>
                              <span className="text-sm text-gray-700 block">
                                Digital Signature
                              </span>
                              <span className="text-xs text-gray-500">
                                Page {mark.page} • {mark.digitalData?.includeTimestamp ? 'With Timestamp' : 'No Timestamp'}
                                {mark.digitalData?.finaliseDocument ? ' • Document Finalised' : ''}
                                {mark.digitalData?.passwordProtection ? ' • Password Protected' : ''}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeMark(mark.id);
                            }}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Apply Digital Signature Button */}
                <button
                  onClick={completeCompanyDigitalSignature}
                  disabled={loading || signatureMarks.filter(m => m.type === 'digital').length === 0}
                  className="w-full bg-gradient-to-r from-green-700 to-green-800 text-white px-4 py-4 rounded-xl font-semibold hover:from-green-800 hover:to-green-900 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Applying Digital Signature...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <Award className="w-5 h-5 mr-2" />
                      Apply Company Digital Signature
                    </span>
                  )}
                </button>

                <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <h4 className="text-sm font-semibold text-blue-900 mb-1">Digital Signature Note</h4>
                  <p className="text-xs text-blue-800">
                    Applies a cryptographic digital signature using the organisation's certificate. 
                    This provides signer identity verification, document integrity protection, and auditability.
                  </p>
                </div>

                {error && (
                  <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex">
                      <AlertCircle className="w-4 h-4 text-red-600 mr-2 flex-shrink-0" />
                      <span className="text-sm text-red-800">{error}</span>
                    </div>
                  </div>
                )}

                {success && (
                  <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex">
                      <CheckCircle2 className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                      <span className="text-sm text-green-800">{success}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* PDF Viewer for Digital Signature */}
          <div className="flex-1 flex flex-col bg-gray-800 relative">
            {/* Mobile sidebar toggle button */}
            {!sidebarVisible && (
              <button
                onClick={toggleSidebar}
                className="absolute top-4 left-4 z-20 md:hidden bg-white p-2 rounded-lg shadow-lg text-gray-700 hover:text-gray-900"
                title="Show configuration"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            )}

            {/* Page Controls - Now matching renderViewAndSign structure */}
            <div className="bg-white border-b border-gray-200 p-3 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <div className="flex items-center bg-gray-100 rounded-lg px-3 py-1">
                    <span className="text-sm font-medium text-gray-700">
                      Page <span className="font-bold">{currentPage}</span> of {totalPages}
                    </span>
                  </div>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 hidden md:inline">
                    <span className="font-medium">Tool:</span>{' '}
                    <span className="text-gray-800">
                      {activeTool === 'digital' ? 'Digital Signature' : 
                       activeTool === 'move' ? 'Move' : 
                       'Select a tool'}
                    </span>
                  </span>
                  <button
                    onClick={() => {
                      if (pdfFile) {
                        const link = document.createElement('a');
                        link.download = pdfFile.name;
                        link.href = URL.createObjectURL(pdfFile);
                        link.click();
                      }
                    }}
                    className="flex items-center px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                  >
                    <Download className="w-3 h-3 mr-1" />
                    Original
                  </button>
                </div>
              </div>
            </div>

            {/* PDF Viewer Container */}
            <div 
            ref={pdfContainerRef} 
              className="flex-1 overflow-auto p-2 md:p-8 flex items-center justify-center bg-gray-800"
              onClick={handleCanvasClick}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={(e) => {
                if (activeTool === 'digital') {
                  e.preventDefault();
                  const touch = e.touches[0];
                  const fakeEvent = { clientX: touch.clientX, clientY: touch.clientY };
                  handleCanvasClick(fakeEvent);
                }
              }}
            >
              {pdfDocument ? (
                <div className="relative">
                  <canvas
                    ref={canvasRef}
                    onMouseDown={(e) => {
                      const canvas = canvasRef.current;
                      if (!canvas || activeTool !== 'move') return;
                      
                      const rect = canvas.getBoundingClientRect();
                      const x = e.clientX - rect.left;
                      const y = e.clientY - rect.top;
                      
                      const scaleX = canvas.width / rect.width;
                      const scaleY = canvas.height / rect.height;
                      const canvasX = x * scaleX;
                      const canvasY = y * scaleY;
                      
                      const a4Coords = canvasToA4(canvasX, canvasY, canvas.width, canvas.height);
                      const currentPageMarks = signatureMarks.filter(m => m.page === currentPage);
                      
                      const mark = currentPageMarks.find(m => 
                        a4Coords.x >= m.x && a4Coords.x <= m.x + m.width &&
                        a4Coords.y >= m.y && a4Coords.y <= m.y + m.height
                      );
                      
                      if (mark) {
                        handleMarkMouseDown(e, mark);
                      }
                    }}
                    onTouchStart={(e) => {
                      if (activeTool !== 'move') return;
                      
                      e.preventDefault();
                      const canvas = canvasRef.current;
                      if (!canvas) return;
                      
                      const touch = e.touches[0];
                      const rect = canvas.getBoundingClientRect();
                      const x = touch.clientX - rect.left;
                      const y = touch.clientY - rect.top;
                      
                      const scaleX = canvas.width / rect.width;
                      const scaleY = canvas.height / rect.height;
                      const canvasX = x * scaleX;
                      const canvasY = y * scaleY;
                      
                      const a4Coords = canvasToA4(canvasX, canvasY, canvas.width, canvas.height);
                      const currentPageMarks = signatureMarks.filter(m => m.page === currentPage);
                      const mark = currentPageMarks.find(m => 
                        a4Coords.x >= m.x && a4Coords.x <= m.x + m.width &&
                        a4Coords.y >= m.y && a4Coords.y <= m.y + m.height
                      );
                      
                      if (mark) {
                        const fakeEvent = { clientX: touch.clientX, clientY: touch.clientY };
                        handleMarkMouseDown(fakeEvent, mark);
                      }
                    }}
                    className="bg-white shadow-2xl"
                    style={{
                      cursor: activeTool === 'digital' ? 'crosshair' :
                              activeTool === 'move' ? (isDragging ? 'grabbing' : 'grab') : 
                              'crosshair',
                      touchAction: 'none'
                    }}
                  />
                </div>
              ) : (
                <div className="text-center text-gray-400">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-lg">Loading PDF document...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Electronic signature complete
  const renderElectronicComplete = () => (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-green-100 rounded-full mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 md:w-12 md:h-12 text-green-600" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Electronic Signature Applied</h2>
          <p className="text-gray-600">Document with electronic signature annotations is ready</p>
        </div>

        <div className="bg-gray-50 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Signature Details</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Document:</span>
              <span className="font-semibold text-gray-900 truncate ml-2">{pdfFile?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Elements Placed:</span>
              <span className="font-semibold text-gray-900">{signatureMarks.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Timestamp:</span>
              <span className="font-semibold text-gray-900">
                {new Date().toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Legal Status:</span>
              <span className="font-semibold text-gray-900">Electronic signature under applicable electronic commerce laws</span>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
          <div className="flex">
            <Info className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <strong>Important Notice:</strong> This document contains electronic signature annotations with trusted timestamp for evidentiary purposes.
              For cryptographic document integrity protection and signer identity verification, apply a Company Digital Signature (PKI).
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => handleDownload('electronic')}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 md:py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl"
          >
            <Download className="w-5 h-5 mr-2" />
            Download with Electronic Signature Annotations
          </button>

          <button
            onClick={() => setStep('company-sign')}
            className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 md:py-4 rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-300 flex items-center justify-center"
          >
            <Award className="w-5 h-5 mr-2" />
            Add Cryptographic Digital Signature (PKI)
          </button>

          <button
            onClick={resetApp}
            className="w-full bg-gray-200 text-gray-700 px-6 py-3 md:py-4 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
          >
            Sign Another Document
          </button>
        </div>
      </div>
    </div>
  );

  // PKI digital signature complete
  const renderPkiComplete = () => (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-green-100 rounded-full mx-auto mb-6">
            <Award className="w-10 h-10 md:w-12 md:h-12 text-green-600" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Digital Signature Successfully Applied</h2>
          <p className="text-gray-600">Document cryptographically signed and protected</p>
        </div>

        {/* Status Banner */}
        {companySignedPdf?.statusBanner && (
          <div className={`mb-6 rounded-xl p-4 ${
            finaliseDocument 
              ? 'bg-purple-50 border border-purple-200 text-purple-800'
              : 'bg-blue-50 border border-blue-200 text-blue-800'
          }`}>
            <div className="flex items-center">
              <Info className="w-5 h-5 mr-2 flex-shrink-0" />
              <span className="font-semibold">{companySignedPdf.statusBanner}</span>
            </div>
          </div>
        )}
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
  <div className="flex">
    <FileCheck className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
    <div className="text-sm text-blue-800">
      <strong>Legal Framework Applied:</strong> This digital signature is suitable for cross-border B2B agreements. 
      Ensure your contract includes governing law, jurisdiction, and digital signature recognition clauses. 
      Courts will uphold signatures that reflect contractual intent and provide proper audit trails.
    </div>
  </div>
</div>

        <div className="bg-gray-50 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Digital Signature Details</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Signer:</span>
              <span className="font-semibold text-gray-900">{companySignedPdf?.staffName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Organisation:</span>
              <span className="font-semibold text-gray-900">{companySignedPdf?.companyName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Timestamp Authority:</span>
              <span className="font-semibold text-gray-900">
                {includeTimestamp ? 'Trusted Timestamp Applied' : 'No Trusted Timestamp'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Document Status:</span>
              <span className="font-semibold text-gray-900">
                {finaliseDocument 
                  ? (passwordProtection 
                    ? 'Finalised with Password Protection'
                    : 'Finalised – Changes Restricted')
                  : 'Digitally Signed – Further Signatures Possible'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Certificate Issuer:</span>
              <span className="font-semibold text-gray-900">Company Certificate Authority</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Integrity Protection:</span>
              <span className="font-semibold text-gray-900">Cryptographically Verified</span>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
          <div className="flex">
            <CheckCircle2 className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-green-800">
              <strong>Digital Signature Successfully Applied</strong> 
              {finaliseDocument 
                ? (passwordProtection 
                  ? ' – Document finalised, locked, and password protected. No further changes permitted.'
                  : ' – Document finalised and locked against further changes.')
                : ' – Document integrity is cryptographically protected. Further signatures may be added.'}
            </div>
          </div>
        </div>

        {/* Show the command that would be executed */}
        {companySignedPdf?.openSignPdfCommand && (
          <div className="mb-6 bg-gray-900 text-gray-100 rounded-xl p-4 overflow-x-auto">
            <h4 className="text-sm font-semibold text-gray-300 mb-2">open-sign-pdf Command Generated:</h4>
            <pre className="text-xs whitespace-pre-wrap">
              {companySignedPdf.openSignPdfCommand}
            </pre>
          </div>
        )}

        {/* Certificate Notice */}
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex">
            <Globe className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <strong>Certificate Notice:</strong> This digital signature uses a company-issued certificate suitable for inter-company transactions.
              Government or statutory submissions may require certificates issued by designated authorities.
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => handleDownload('pki')}
            className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 md:py-4 rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl"
          >
            <Download className="w-5 h-5 mr-2" />
            Download Digitally Signed Document
          </button>

          {personalSignedPdf && (
            <button
              onClick={() => handleDownload('electronic')}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 md:py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300"
            >
              Download Electronic Signature Version
            </button>
          )}

          <button
            onClick={resetApp}
            className="w-full bg-gray-200 text-gray-700 px-6 py-3 md:py-4 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
          >
            Sign Another Document
          </button>
        </div>
      </div>
    </div>
  );

  // Update the return statement in the main component:
return (
  <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
    <TutorialModal 
      showTutorial={showTutorial} 
      setShowTutorial={setShowTutorial} 
      step={step}
      fileInputRef={fileInputRef}
    />
    
    <LegalFrameworkModal 
      showLegalModal={showLegalModal}
      setShowLegalModal={setShowLegalModal}
    />
    
    <DataPrivacyModal 
      showPrivacyModal={showPrivacyModal}
      setShowPrivacyModal={setShowPrivacyModal}
    />
    
    {showPrivacyBanner && (
  <PrivacyBanner 
    showPrivacyBanner={showPrivacyBanner}
    setShowPrivacyBanner={setShowPrivacyBanner}
    setShowPrivacyModal={setShowPrivacyModal}
    setShowLegalModal={setShowLegalModal}
  />
)}
    
    <div className="flex-1">
      {step === 'upload' && (
        <>
          {renderUpload()}
          <div className="max-w-6xl mx-auto px-4 md:px-8 pb-8">
            <CopyrightFooter 
              onOpenLegal={() => setShowLegalModal(true)}
              onOpenPrivacy={() => setShowPrivacyModal(true)}
            />
          </div>
        </>
      )}
      {step === 'view-sign' && renderViewAndSign()}
        {step === 'company-sign' && renderCompanySign()}
        {step === 'electronic-complete' && (
          <>
            {renderElectronicComplete()}
            <div className="max-w-4xl mx-auto px-4 md:px-8 pb-8">
              <CopyrightFooter />
            </div>
          </>
        )}
        {step === 'pki-complete' && (
          <>
            {renderPkiComplete()}
            <div className="max-w-4xl mx-auto px-4 md:px-8 pb-8">
              <CopyrightFooter />
            </div>
          </>
        )}
      </div>
    </div>
);
};

export default PDFSignatureApp;