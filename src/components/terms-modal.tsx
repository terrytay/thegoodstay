"use client";

import { useState, useRef, useEffect } from "react";
import { X, FileText, CheckCircle, AlertCircle } from "lucide-react";

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: (signatureData: string) => void;
}

export default function TermsModal({ isOpen, onClose, onAccept }: TermsModalProps) {
  const [hasScrolledToEnd, setHasScrolledToEnd] = useState(false);
  const [hasAgreed, setHasAgreed] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [signatureData, setSignatureData] = useState("");
  
  const contentRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    if (isOpen) {
      // Reset states when modal opens
      setHasScrolledToEnd(false);
      setHasAgreed(false);
      setHasSignature(false);
      setSignatureData("");
      clearSignature();
    }
  }, [isOpen]);

  const handleScroll = () => {
    if (contentRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
      const hasScrolledToBottom = scrollTop + clientHeight >= scrollHeight - 10; // 10px tolerance
      setHasScrolledToEnd(hasScrolledToBottom);
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
    setHasSignature(false);
    setSignatureData("");
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.beginPath();
        ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
      }
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
        ctx.stroke();
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.strokeStyle = "#000000";
      }
    }
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      setHasSignature(true);
      
      // Save signature data
      const canvas = canvasRef.current;
      if (canvas) {
        const dataUrl = canvas.toDataURL("image/png");
        setSignatureData(dataUrl);
      }
    }
  };

  const handleAccept = () => {
    if (hasScrolledToEnd && hasAgreed && hasSignature && signatureData) {
      onAccept(signatureData);
      onClose();
    }
  };

  const canProceed = hasScrolledToEnd && hasAgreed && hasSignature;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200">
          <div className="flex items-center space-x-3">
            <FileText className="h-6 w-6 text-amber-600" />
            <h2 className="text-xl font-semibold text-neutral-900">
              Terms and Conditions - Dog Assessment Services
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div 
          ref={contentRef}
          onScroll={handleScroll}
          className="flex-1 p-6 overflow-y-auto space-y-6 text-neutral-700 leading-relaxed"
        >
          <div className="prose max-w-none">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">
              Assessment Service Agreement
            </h3>
            
            <div className="space-y-4">
              <section>
                <h4 className="font-semibold text-neutral-900">1. Assessment Fee Structure</h4>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>Home Visit Assessment:</strong> $25.00 fee applies for assessments conducted at your residence or location of your convenience</li>
                  <li><strong>Park Assessment:</strong> No fee for assessments conducted at Clementi Woods Park (613 Clementi West St 1, Singapore)</li>
                  <li><strong>Non-Refundable Policy:</strong> The $25.00 assessment fee is non-refundable, regardless of the outcome of the assessment, including if your dog is deemed unsuitable for our services</li>
                </ul>
              </section>

              <section>
                <h4 className="font-semibold text-neutral-900">2. Purpose and Scope of Assessment</h4>
                <ul className="list-disc pl-5 space-y-2">
                  <li>The assessment is designed to evaluate your dog's temperament, behavior patterns, and compatibility with our boarding services</li>
                  <li>We assess factors including but not limited to: socialization with other dogs, response to handling, stress indicators, and overall suitability for group care</li>
                  <li>The assessment ensures the safety and well-being of all dogs in our care and our staff members</li>
                </ul>
              </section>

              <section>
                <h4 className="font-semibold text-neutral-900">3. Owner Responsibilities</h4>
                <ul className="list-disc pl-5 space-y-2">
                  <li>You must provide accurate and honest information about your dog's behavioral history, medical conditions, and any previous incidents</li>
                  <li>All vaccination records must be current and provided prior to assessment</li>
                  <li>You are responsible for your dog's behavior during the assessment period</li>
                  <li>Any aggressive behavior, biting, or actions that pose risk to safety may result in immediate termination of services</li>
                </ul>
              </section>

              <section>
                <h4 className="font-semibold text-neutral-900">4. Service Decisions and Liability</h4>
                <ul className="list-disc pl-5 space-y-2">
                  <li>We reserve the right to decline boarding services if a dog exhibits aggression or any behavior that poses a risk to other animals or staff</li>
                  <li>Assessment results are final and at the sole discretion of The Good Stay team</li>
                  <li>We are not liable for any injuries that may occur during the assessment process</li>
                  <li>Pet owners assume full responsibility for any damages caused by their dog during assessment</li>
                </ul>
              </section>

              <section>
                <h4 className="font-semibold text-neutral-900">5. Scheduling and Cancellations</h4>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Assessments are scheduled in advance based on availability</li>
                  <li>A minimum of 24 hours notice is required for rescheduling or cancellations</li>
                  <li>Late cancellations (less than 24 hours) may forfeit the right to reschedule</li>
                  <li>No-shows will forfeit the assessment fee if paid</li>
                </ul>
              </section>

              <section>
                <h4 className="font-semibold text-neutral-900">6. Health and Safety Requirements</h4>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Dogs must be current on all required vaccinations (Rabies, DHPP, Bordetella)</li>
                  <li>Dogs showing signs of illness will not be assessed and owners will be asked to reschedule</li>
                  <li>Flea and tick prevention must be current</li>
                  <li>Dogs must be leashed at all times during park assessments</li>
                </ul>
              </section>

              <section>
                <h4 className="font-semibold text-neutral-900">7. Data Protection and Privacy</h4>
                <ul className="list-disc pl-5 space-y-2">
                  <li>All information provided during the assessment process will be kept confidential</li>
                  <li>Assessment records may be retained for future reference and service decisions</li>
                  <li>Photos or videos may be taken during assessment for documentation purposes</li>
                </ul>
              </section>

              <section>
                <h4 className="font-semibold text-neutral-900">8. Contact and Communication</h4>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Assessment results and recommendations will be communicated within 24 hours of completion</li>
                  <li>All future communications regarding booking and services will be conducted via provided contact information</li>
                  <li>Changes to contact information must be promptly communicated to avoid service disruptions</li>
                </ul>
              </section>

              <section>
                <h4 className="font-semibold text-neutral-900">9. Agreement Acceptance</h4>
                <p className="text-neutral-700">
                  By proceeding with this assessment booking and providing your digital signature below, you acknowledge that you have read, understood, and agree to be bound by all terms and conditions outlined in this agreement. You confirm that all information provided is accurate and complete to the best of your knowledge.
                </p>
              </section>
            </div>
          </div>

          {/* Scroll indicator */}
          {!hasScrolledToEnd && (
            <div className="sticky bottom-0 bg-gradient-to-t from-white via-white to-transparent pt-4 pb-2">
              <div className="flex items-center justify-center space-x-2 text-amber-600 animate-bounce">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Please scroll to the end to continue</span>
              </div>
            </div>
          )}
        </div>

        {/* Agreement Section */}
        <div className="border-t border-neutral-200 p-6 space-y-4">
          {/* Scroll completion indicator */}
          <div className="flex items-center space-x-2">
            <CheckCircle className={`h-5 w-5 ${hasScrolledToEnd ? 'text-green-600' : 'text-neutral-300'}`} />
            <span className={`text-sm ${hasScrolledToEnd ? 'text-green-600' : 'text-neutral-400'}`}>
              Read terms and conditions to completion
            </span>
          </div>

          {/* Agreement checkbox */}
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="agree-terms"
              checked={hasAgreed}
              onChange={(e) => setHasAgreed(e.target.checked)}
              disabled={!hasScrolledToEnd}
              className="mt-1 h-4 w-4 text-amber-600 border-neutral-300 rounded focus:ring-amber-500 disabled:opacity-50"
            />
            <label 
              htmlFor="agree-terms" 
              className={`text-sm ${hasScrolledToEnd ? 'text-neutral-700' : 'text-neutral-400'}`}
            >
              I have read and agree to the terms and conditions above. I understand that the assessment fee is non-refundable and that The Good Stay reserves the right to decline services based on the assessment outcome.
            </label>
          </div>

          {/* Digital Signature */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className={`text-sm font-medium ${hasAgreed ? 'text-neutral-700' : 'text-neutral-400'}`}>
                Digital Signature *
              </label>
              <button
                type="button"
                onClick={clearSignature}
                disabled={!hasAgreed}
                className="text-xs text-amber-600 hover:text-amber-700 disabled:opacity-50"
              >
                Clear Signature
              </button>
            </div>
            
            <div className="border-2 border-dashed border-neutral-300 rounded-lg p-4 bg-neutral-50">
              <canvas
                ref={canvasRef}
                width={400}
                height={150}
                className={`w-full h-32 bg-white border border-neutral-200 rounded cursor-crosshair ${!hasAgreed ? 'opacity-50 cursor-not-allowed' : ''}`}
                onMouseDown={hasAgreed ? startDrawing : undefined}
                onMouseMove={hasAgreed ? draw : undefined}
                onMouseUp={hasAgreed ? stopDrawing : undefined}
                onMouseLeave={hasAgreed ? stopDrawing : undefined}
              />
              <p className="text-xs text-neutral-500 mt-2 text-center">
                {hasAgreed ? "Sign above with your mouse or touch device" : "Please read and agree to terms first"}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAccept}
              disabled={!canProceed}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                canProceed
                  ? "bg-amber-600 text-white hover:bg-amber-700"
                  : "bg-neutral-300 text-neutral-500 cursor-not-allowed"
              }`}
            >
              Accept Terms & Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}