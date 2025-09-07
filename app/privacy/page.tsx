"use client";

import React from 'react';
import Image from "next/image";
import { Database, Settings2, Share2, ShieldCheck, UserCheck, Cookie, ExternalLink, FileClock, Mail } from 'lucide-react';

const policySections = [
    {
        icon: <Database size={24} />,
        title: "1. Information We Collect",
        content: [
            "We may collect the following types of information:",
            "<strong>Personal Information:</strong> Name, email address, or contact details you provide when subscribing to newsletters, commenting, or contacting us.",
            "<strong>Non-Personal Information:</strong> Browser type, device information, IP address, and usage data collected automatically through cookies and analytics tools.",
            "<strong>Third-Party Platforms:</strong> When you interact with our YouTube channel or social media, those platforms may share limited information with us in line with their own privacy policies."
        ]
    },
    {
        icon: <Settings2 size={24} />,
        title: "2. How We Use Your Information",
        content: [
            "We use your information to:",
            "Deliver and improve our content and services.",
            "Respond to queries, feedback, and communication.",
            "Send updates, newsletters, or promotional material (only with your consent).",
            "Analyze viewer engagement to enhance user experience.",
            "Comply with applicable legal obligations."
        ]
    },
    {
        icon: <Share2 size={24} />,
        title: "3. Sharing of Information",
        content: [
            "We do not sell or rent your personal data. We may share information only:",
            "With trusted third-party service providers (e.g., analytics, hosting, or email services).",
            "As required by law, regulation, or government authority.",
            "To protect the rights, property, or safety of Dialogus and its community."
        ]
    },
    {
        icon: <ShieldCheck size={24} />,
        title: "4. Data Security",
        content: [
            "We adopt reasonable technical and organizational measures to safeguard your data. However, no transmission over the Internet can be guaranteed 100% secure, and you use our services at your own risk."
        ]
    },
    {
        icon: <UserCheck size={24} />,
        title: "5. Your Rights",
        content: [
            "In line with the Digital Personal Data Protection Act, 2023, you have the right to:",
            "Access and review your personal data.",
            "Request corrections or updates.",
            "Withdraw consent for data processing (subject to legal/contractual limitations).",
            "Request deletion of personal data, where applicable."
        ]
    },
    {
        icon: <Cookie size={24} />,
        title: "6. Cookies and Tracking",
        content: [
            "We may use cookies and similar technologies to analyze trends, track user movements, and gather demographic information. You can manage cookie preferences through your browser settings."
        ]
    },
    {
        icon: <ExternalLink size={24} />,
        title: "7. Third-Party Links",
        content: [
            "Our content may include links to third-party websites or services. We are not responsible for their privacy practices and encourage you to review their policies."
        ]
    },
    {
        icon: <FileClock size={24} />,
        title: "8. Updates to This Policy",
        content: [
            "We may update this Privacy Policy from time to time. The updated version will be posted on this page with the effective date."
        ]
    },
    {
        icon: <Mail size={24} />,
        title: "9. Contact Us",
        content: [
            "If you have any questions or concerns about this Privacy Policy or our practices, please contact us at:",
            "<span class='mt-4 block text-gray-200'>[Official email address]</span>",
            "<span class='text-gray-400 text-sm'>[Registered address]</span>"
        ]
    }
];

const PrivacyPolicyPage = () => {
    return (
        <main className="pt-24">
            <section id="privacy-policy" className="py-20 md:py-28 overflow-hidden">
                <div className="container mx-auto px-6">
                    <div className="grid lg:grid-cols-3 gap-16 items-start">
                        {/* Left column: Visual graphic */}
                        <div className="relative hidden lg:flex justify-center items-start h-full pt-16">
                            <div className="sticky top-32">
                                <div className="absolute w-80 h-80 bg-fuchsia-500 rounded-full opacity-10 blur-3xl"></div>
                                <div className="absolute w-64 h-64 bg-cyan-500 rounded-full opacity-10 blur-3xl bottom-0 right-0"></div>
                                <div className="relative w-full max-w-sm">
                                    <Image
                                        src="/NEW LOGO.png"
                                        alt="Dialogus Logo Mark"
                                        width={600}
                                        height={200}
                                        className="w-full h-auto opacity-5"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Right column: Content */}
                        <div className="lg:col-span-2">
                            <div className="max-w-4xl">
                                <div className="mb-12">
                                    <h1 className="section-title text-3xl md:text-4xl mb-4">Privacy Policy</h1>
                                    <p className="text-gray-400">Effective Date: September 8, 2025</p>
                                </div>

                                <div className="text-gray-300 space-y-12 text-base leading-relaxed">
                                    <p>
                                        Dialogus (“we,” “our,” “us”) is committed to protecting the privacy of our viewers, subscribers, and users (“you,” “your”). This Privacy Policy explains how we collect, use, disclose and safeguard your information when you access our website, YouTube channel, or other digital platforms linked to Dialogus. By engaging with our content, you agree to the practices described here:
                                    </p>

                                    {policySections.map((section, index) => (
                                        <div key={index} className="flex items-start gap-6">
                                            <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg bg-fuchsia-500/10 text-fuchsia-400 mt-1">
                                                {section.icon}
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-bold text-white mb-3">{section.title}</h2>
                                                {Array.isArray(section.content) ? (
                                                    section.content.length > 1 ? (
                                                        <>
                                                            <p className="mb-3" dangerouslySetInnerHTML={{ __html: section.content[0] }}></p>
                                                            <ul className="space-y-2 text-gray-400">
                                                                {section.content.slice(1).map((item, i) => (
                                                                    <li key={i} dangerouslySetInnerHTML={{ __html: item }}></li>
                                                                ))}
                                                            </ul>
                                                        </>
                                                    ) : (
                                                        <p className="text-gray-400" dangerouslySetInnerHTML={{ __html: section.content[0] }}></p>
                                                    )
                                                ) : null}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default PrivacyPolicyPage;

