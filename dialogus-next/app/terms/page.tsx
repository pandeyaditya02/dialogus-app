"use client";

import React from 'react';
import Image from "next/image";
import { FileCheck, Copyright, UserX, AlertTriangle, ShieldAlert, ShieldCheck, XCircle, Scale, FileClock, Mail } from 'lucide-react';

const termsSections = [
    {
        icon: <FileCheck size={24} />,
        title: "1. Acceptance of Terms",
        content: [
            "By accessing or using Dialogus, you agree to these Terms, our Privacy Policy, and all applicable laws and regulations in India. If you do not agree, please discontinue using our services."
        ]
    },
    {
        icon: <Copyright size={24} />,
        title: "2. Use of Content",
        content: [
            "<strong>All content on Dialogus</strong> — including videos, articles, graphics, logos and designs — is the intellectual property of Dialogus or its licensors, protected under Indian copyright and trademark laws.",
            "You may view, share, or link to our content for personal, non-commercial purposes.",
            "You may not copy, reproduce, distribute, or modify our content without prior written permission."
        ]
    },
    {
        icon: <UserX size={24} />,
        title: "3. User Conduct",
        content: [
            "You agree not to:",
            "Post, share, or transmit unlawful, defamatory, obscene, or harmful material.",
            "Use the Platform to promote violence, hatred, or misinformation.",
            "Attempt to hack, disrupt, or interfere with the functioning of the Platform.",
            "Impersonate Dialogus, its staff, or other users.",
            "We reserve the right to moderate, remove, or restrict any comments, posts, or activities that violate these Terms."
        ]
    },
    {
        icon: <AlertTriangle size={24} />,
        title: "4. Disclaimers",
        content: [
            "The content provided on Dialogus is for informational and educational purposes only.",
            "While we strive for accuracy, we do not guarantee the completeness, reliability, or timeliness of information.",
            "Views expressed by contributors, experts, or guests are their own and do not necessarily reflect the official position of Dialogus."
        ]
    },
    {
        icon: <ShieldAlert size={24} />,
        title: "5. Limitation of Liability",
        content: [
            "Dialogus shall not be held liable for:",
            "Any direct, indirect, incidental, or consequential damages arising from your use of the Platform.",
            "Loss of data, profits, or goodwill due to reliance on our content.",
            "Third-party links, ads, or services accessed through our Platform."
        ]
    },
    {
        icon: <ShieldCheck size={24} />,
        title: "6. Privacy",
        content: [
            "Your use of the Platform is also governed by our Privacy Policy, which outlines how we collect, use, and safeguard your personal information in compliance with Indian laws."
        ]
    },
    {
        icon: <XCircle size={24} />,
        title: "7. Termination",
        content: [
            "We reserve the right to suspend or terminate your access to Dialogus at our sole discretion if you violate these Terms or engage in activities harmful to the Platform or its community."
        ]
    },
    {
        icon: <Scale size={24} />,
        title: "8. Governing Law & Jurisdiction",
        content: [
            "These Terms shall be governed by and interpreted in accordance with the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Delhi, India."
        ]
    },
    {
        icon: <FileClock size={24} />,
        title: "9. Updates to Terms",
        content: [
            "We may update these Terms from time to time. The revised version will be posted with a new effective date. Continued use of the Platform constitutes acceptance of the updated Terms."
        ]
    },
    {
        icon: <Mail size={24} />,
        title: "10. Contact Us",
        content: [
            "For questions or concerns about these Terms, please contact us at:",
            "<span class='mt-4 block text-gray-200'>[Official email address]</span>",
            "<span class='text-gray-400 text-sm'>[Registered address]</span>"
        ]
    }
];

const TermsOfServicePage = () => {
    return (
        <main className="pt-24">
            <section id="terms-of-service" className="py-20 md:py-28 overflow-hidden">
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
                                    <h1 className="section-title text-3xl md:text-4xl mb-4">Terms of Service</h1>
                                    <p className="text-gray-400">Effective Date: September 8, 2025</p>
                                </div>

                                <div className="text-gray-300 space-y-12 text-base leading-relaxed">
                                    <p>
                                        Welcome to Dialogus (“we,” “our,” “us”). By accessing or using our website, YouTube channel, or any related digital services (“Platform”), you agree to comply with and be bound by these Terms of Service (“Terms”). Please read them carefully before using our Platform.
                                    </p>

                                    {termsSections.map((section, index) => (
                                        <div key={index} className="flex items-start gap-6">
                                            <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg bg-fuchsia-500/10 text-fuchsia-400 mt-1">
                                                {section.icon}
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-bold text-white mb-3">{section.title}</h2>
                                                {Array.isArray(section.content) ? (
                                                    section.content.length > 1 ? (
                                                        <ul className="space-y-2 text-gray-400">
                                                            {section.content.map((item, i) => (
                                                                <li key={i} dangerouslySetInnerHTML={{ __html: `●&nbsp;&nbsp;${item}` }}></li>
                                                            ))}
                                                        </ul>
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

export default TermsOfServicePage;
