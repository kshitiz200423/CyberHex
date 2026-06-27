import React, { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import StepIndicator from '@/components/ui/StepIndicator';
import { FieldWrap, Input, Select, Textarea } from '@/components/ui/FormField';
import FileDropZone from '@/components/ui/FileDropZone';

const contactSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Valid email required'),
  phone: z.string().min(10, 'Valid phone number required'),
  orgName: z.string().min(2, 'Organisation name is required'),
  orgSize: z.string().min(1, 'Please select organisation size'),
  services: z.array(z.string()).min(1, 'Select at least one service'),
  budget: z.string().optional(),
  timeline: z.string().optional(),
  scope: z.string().min(20, 'Please describe your scope (min 20 characters)'),
  notes: z.string().optional(),
});

type ContactForm = z.infer<typeof contactSchema>;

const STEPS = [
  { label: 'Organisation' },
  { label: 'Services' },
  { label: 'Scope' },
  { label: 'Review' },
];

const SERVICES_LIST = [
  { id: 'vapt', label: 'VAPT', desc: 'Vulnerability Assessment & Penetration Testing' },
  { id: 'audit', label: 'Security Audits', desc: 'ISO 27001, RBI, CERT-In Compliance' },
  { id: 'consultancy', label: 'Consultancy', desc: 'CISO-as-a-Service, Security Advisory' },
  { id: 'soc', label: 'Managed SOC', desc: '24/7 Security Monitoring' },
  { id: 'training', label: 'Security Training', desc: 'Phishing Simulations, Workshops' },
  { id: 'appsec', label: 'Cloud & App Security', desc: 'OWASP, API, DevSecOps' },
];

const TIMELINES = ['Immediate', '1-2 weeks', '1 month', 'Flexible'];

const Contact: React.FC = () => {
  const [step, setStep] = useState(0);
  const [files, setFiles] = useState<File[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedTimeline, setSelectedTimeline] = useState('Flexible');
  const [budgetValue, setBudgetValue] = useState(50);

  const { register, handleSubmit, formState: { errors }, getValues, trigger, watch } = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
    defaultValues: { services: [], timeline: 'Flexible', budget: '₹1-5 Lakh' },
  });

  const budgetLabels = ['₹50K', '₹1L', '₹2L', '₹5L', '₹10L', '₹25L', '₹50L+'];
  const budgetDisplay = budgetLabels[Math.min(Math.floor(budgetValue / 16), 6)];

  const nextStep = useCallback(async () => {
    let valid = true;
    if (step === 0) valid = await trigger(['firstName', 'lastName', 'email', 'phone', 'orgName', 'orgSize']);
    if (step === 2) valid = await trigger(['scope']);
    if (valid) setStep((s) => Math.min(s + 1, 3));
  }, [step, trigger]);

  const prevStep = useCallback(() => setStep((s) => Math.max(s - 1, 0)), []);

  const toggleService = useCallback((id: string) => {
    setSelectedServices((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  }, []);

  const onSubmit = useCallback((data: ContactForm) => {
    const ref = `AX-CONTACT-${Date.now().toString(36).toUpperCase()}`;
    setSubmitted(true);
  }, []);

  if (submitted) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8 animate-fade-up">
          <div className="w-20 h-20 rounded-full bg-brand-green/20 flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-brand-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="font-display text-3xl font-bold text-text mb-3">Request Submitted!</h2>
          <p className="text-text-2 mb-4">Thank you for reaching out. Our team will contact you within 4 hours.</p>
          <p className="font-mono text-sm text-accent mb-8">Reference: AX-CONTACT-{Date.now().toString(36).toUpperCase().slice(0, 6)}</p>
          <a href="/" className="btn-primary">Back to Home</a>
        </div>
      </div>
    );
  }

  const values = getValues();

  return (
    <div className="pt-20">
      <section className="section bg-grid-pattern border-b border-border">
        <div className="container-custom">
          <p className="mono-label text-[11px] text-accent mb-3">GET IN TOUCH</p>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-text mb-4">
            Request a Security Assessment
          </h1>
          <p className="text-lg text-text-2 max-w-2xl">Tell us about your organisation and security needs. We'll get back to you within 4 hours with a customised proposal.</p>
        </div>
      </section>

      <section className="section">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Form */}
            <div className="lg:col-span-2">
              <div className="mb-12">
                <StepIndicator steps={STEPS} currentStep={step} />
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="mt-12">
                {/* Step 0: Organisation */}
                {step === 0 && (
                  <div className="space-y-5 animate-fade-in">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <FieldWrap label="First Name" htmlFor="firstName" error={errors.firstName?.message} required>
                        <Input id="firstName" placeholder="John" error={!!errors.firstName} {...register('firstName')} />
                      </FieldWrap>
                      <FieldWrap label="Last Name" htmlFor="lastName" error={errors.lastName?.message} required>
                        <Input id="lastName" placeholder="Doe" error={!!errors.lastName} {...register('lastName')} />
                      </FieldWrap>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <FieldWrap label="Email" htmlFor="email" error={errors.email?.message} required>
                        <Input id="email" type="email" placeholder="john@company.com" error={!!errors.email} {...register('email')} />
                      </FieldWrap>
                      <FieldWrap label="Phone" htmlFor="phone" error={errors.phone?.message} required>
                        <Input id="phone" type="tel" placeholder="+91 98765 43210" error={!!errors.phone} {...register('phone')} />
                      </FieldWrap>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <FieldWrap label="Organisation" htmlFor="orgName" error={errors.orgName?.message} required>
                        <Input id="orgName" placeholder="Company Name" error={!!errors.orgName} {...register('orgName')} />
                      </FieldWrap>
                      <FieldWrap label="Organisation Size" htmlFor="orgSize" error={errors.orgSize?.message} required>
                        <Select id="orgSize" error={!!errors.orgSize} placeholder="Select size" options={[
                          { value: '1-10', label: '1-10 employees' },
                          { value: '11-50', label: '11-50 employees' },
                          { value: '51-200', label: '51-200 employees' },
                          { value: '201-500', label: '201-500 employees' },
                          { value: '500+', label: '500+ employees' },
                        ]} {...register('orgSize')} />
                      </FieldWrap>
                    </div>
                  </div>
                )}

                {/* Step 1: Services */}
                {step === 1 && (
                  <div className="space-y-6 animate-fade-in">
                    <FieldWrap label="Select Services" htmlFor="services" error={selectedServices.length === 0 ? 'Select at least one' : undefined} required>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {SERVICES_LIST.map((svc) => (
                          <button key={svc.id} type="button" onClick={() => toggleService(svc.id)}
                            className={`text-left p-4 rounded-lg border transition-all ${
                              selectedServices.includes(svc.id) ? 'border-accent bg-accent/10' : 'border-border bg-surface hover:border-border-2'
                            }`}>
                            <p className="text-sm font-medium text-text">{svc.label}</p>
                            <p className="text-xs text-text-3 mt-1">{svc.desc}</p>
                          </button>
                        ))}
                      </div>
                    </FieldWrap>

                    <FieldWrap label="Budget Range" htmlFor="budget">
                      <div className="px-2">
                        <input type="range" min="0" max="100" value={budgetValue}
                          onChange={(e) => setBudgetValue(Number(e.target.value))}
                          className="w-full h-1.5 bg-surface rounded-lg appearance-none cursor-pointer accent-accent" />
                        <div className="flex justify-between mt-1">
                          <span className="text-xs text-text-3">₹50K</span>
                          <span className="text-sm font-mono text-accent">{budgetDisplay}</span>
                          <span className="text-xs text-text-3">₹50L+</span>
                        </div>
                      </div>
                    </FieldWrap>

                    <FieldWrap label="Timeline" htmlFor="timeline">
                      <div className="flex flex-wrap gap-2">
                        {TIMELINES.map((t) => (
                          <button key={t} type="button" onClick={() => setSelectedTimeline(t)}
                            className={`px-4 py-2 rounded-lg text-xs font-mono transition-all ${
                              selectedTimeline === t ? 'bg-accent text-white' : 'bg-surface text-text-2 hover:bg-surface-2'
                            }`}>
                            {t}
                          </button>
                        ))}
                      </div>
                    </FieldWrap>
                  </div>
                )}

                {/* Step 2: Scope */}
                {step === 2 && (
                  <div className="space-y-5 animate-fade-in">
                    <FieldWrap label="Scope Description" htmlFor="scope" error={errors.scope?.message} required hint="Describe your environment, systems, and what you'd like assessed.">
                      <Textarea id="scope" rows={6} placeholder="e.g., We have 5 web applications, 2 mobile apps, and a cloud infrastructure on AWS. We'd like a full VAPT covering..." error={!!errors.scope} {...register('scope')} />
                    </FieldWrap>
                    <FieldWrap label="Attachments" htmlFor="files" hint="Upload scope documents, network diagrams, or existing reports.">
                      <FileDropZone onFilesSelected={setFiles} files={files} maxFiles={3} />
                    </FieldWrap>
                    <FieldWrap label="Additional Notes" htmlFor="notes">
                      <Textarea id="notes" rows={3} placeholder="Any specific requirements, compliance deadlines, or questions..." {...register('notes')} />
                    </FieldWrap>
                  </div>
                )}

                {/* Step 3: Review */}
                {step === 3 && (
                  <div className="space-y-4 animate-fade-in">
                    <h3 className="font-display text-xl font-bold text-text mb-4">Review Your Request</h3>
                    <div className="card space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div><span className="mono-label text-[10px] block mb-1">NAME</span><span className="text-text">{values.firstName} {values.lastName}</span></div>
                        <div><span className="mono-label text-[10px] block mb-1">EMAIL</span><span className="text-text">{values.email}</span></div>
                        <div><span className="mono-label text-[10px] block mb-1">PHONE</span><span className="text-text">{values.phone}</span></div>
                        <div><span className="mono-label text-[10px] block mb-1">ORGANISATION</span><span className="text-text">{values.orgName} ({values.orgSize})</span></div>
                      </div>
                      <div className="border-t border-border pt-4">
                        <span className="mono-label text-[10px] block mb-2">SERVICES</span>
                        <div className="flex flex-wrap gap-2">
                          {selectedServices.map((s) => (
                            <span key={s} className="pill bg-accent/10 text-accent">{SERVICES_LIST.find(x => x.id === s)?.label}</span>
                          ))}
                        </div>
                      </div>
                      <div className="border-t border-border pt-4">
                        <span className="mono-label text-[10px] block mb-1">BUDGET</span>
                        <span className="text-text text-sm">{budgetDisplay}</span>
                        <span className="mx-4 text-text-3">·</span>
                        <span className="mono-label text-[10px]">TIMELINE</span>
                        <span className="text-text text-sm ml-2">{selectedTimeline}</span>
                      </div>
                      <div className="border-t border-border pt-4">
                        <span className="mono-label text-[10px] block mb-1">SCOPE</span>
                        <p className="text-text-2 text-sm">{values.scope || 'Not provided'}</p>
                      </div>
                      {files.length > 0 && (
                        <div className="border-t border-border pt-4">
                          <span className="mono-label text-[10px] block mb-1">ATTACHMENTS</span>
                          <p className="text-text-2 text-sm">{files.length} file(s)</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex items-center justify-between mt-8">
                  {step > 0 ? (
                    <button type="button" onClick={prevStep} className="btn-outline">← Previous</button>
                  ) : <div />}
                  {step < 3 ? (
                    <button type="button" onClick={nextStep} className="btn-primary">Next →</button>
                  ) : (
                    <button type="submit" className="btn-primary">Submit Request</button>
                  )}
                </div>
              </form>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="card">
                <h3 className="font-display text-lg font-bold text-text mb-4">Contact Info</h3>
                <div className="space-y-3 text-sm text-text-2">
                  <p>📧 contact@auronixtechnologies.com</p>
                  <p>📱 +91 9953933965</p>
                  <p>📍 Gurugram, Haryana, India</p>
                </div>
              </div>
              <div className="card">
                <p className="mono-label text-[10px] mb-2">RESPONSE TIME</p>
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex-1 h-2 bg-surface-2 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-green rounded-full w-[85%] animate-pulse-slow" />
                  </div>
                  <span className="font-mono text-sm text-brand-green">&lt; 4hrs</span>
                </div>
                <p className="text-xs text-text-3">Average response time for new requests</p>
              </div>
              <div className="card">
                <h4 className="font-display text-sm font-bold text-text mb-3">Trust Guarantees</h4>
                <ul className="space-y-2">
                  {['NDA-protected engagement', 'CERT-In empanelled team', 'No obligations until you approve', 'Fixed-price proposals'].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-text-2">
                      <svg className="w-4 h-4 text-brand-green flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="card bg-accent/5 border-accent/20">
                <h4 className="font-display text-sm font-bold text-accent mb-2">Free Consultation</h4>
                <p className="text-xs text-text-2 mb-3">Book a 30-minute call with our security experts at no cost.</p>
                <a href="mailto:contact@auronixtechnologies.com" className="btn-primary text-xs w-full text-center">Book a Call</a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
