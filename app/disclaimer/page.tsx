"use client";

import React from 'react';
import { BriefcaseBusiness, ShieldCheck, ExternalLink, UserCheck, AlertTriangle, FileClock } from 'lucide-react';

// --- Disclaimer Page Content ---
const disclaimerCards = [
    {
        icon: <BriefcaseBusiness />,
        title: "No Professional Advice",
        text: "Our content is for informational purposes and does not constitute legal, financial, or medical advice. Please consult a qualified professional for specific guidance."
    },
    {
        icon: <ShieldCheck />,
        title: "Accuracy of Information",
        text: "While we strive for accuracy, we make no guarantees. Opinions expressed by hosts or guests are their own and not necessarily the views of Dialogus."
    },
    {
        icon: <ExternalLink />,
        title: "Third-Party Content",
        text: "We are not responsible for the content or practices of any third-party websites or services linked to from our platforms. Use them at your own risk."
    },
    {
        icon: <UserCheck />,
        title: "Viewer Responsibility",
        text: "You are solely responsible for how you interpret and use the information we provide. We do not endorse harmful or unlawful interpretations of our content."
    },
    {
        icon: <AlertTriangle />,
        title: "Limitation of Liability",
        text: "Dialogus and its team shall not be held liable for any damages or losses arising from the use of our content. This includes financial or reputational harm."
    },
    {
        icon: <FileClock />,
        title: "Updates to Disclaimer",
        text: "We may update this notice periodically. The updated version will be posted here with a new effective date to reflect any changes in our operations or laws."
    }
];

const DisclaimerCard = ({ icon, title, text }: { icon: React.ReactNode, title: string, text: string }) => (
    <div className="card-base p-6 text-center items-center flex flex-col">
        <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-fuchsia-500/10 text-fuchsia-400">
            {icon}
        </div>
        <h3 className="text-lg font-bold text-white mt-4">{title}</h3>
        <p className="text-gray-400 text-sm mt-2 flex-grow">{text}</p>
    </div>
);


const DisclaimerContent = () => {
    return (
        <main className="pt-24">
            <section id="disclaimer" className="py-20 md:py-28">
                <div className="container mx-auto px-6">
                    <div className="max-w-5xl mx-auto">
                        <div className="text-center">
                            <h2 className="section-title text-3xl md:text-4xl mb-4">Disclaimer Notice</h2>
                            <p className="text-gray-400 max-w-2xl mx-auto">The following terms apply to all content on our website, YouTube channel, and other digital platforms. By accessing our content, you agree to this notice.</p>
                        </div>

                        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                           {disclaimerCards.map(card => <DisclaimerCard key={card.title} {...card} />)}
                        </div>

                        {/* <div className="mt-16 text-center border-t border-gray-800 pt-10">
                            <h3 className="text-xl font-semibold text-white mb-3">Contact Us</h3>
                            <p className="text-gray-400">If you have any questions about this Disclaimer Notice, please contact us at:</p>
                            <p className="mt-4 text-gray-200">[Official email address]</p>
                            <p className="text-gray-400 text-sm">[Registered address]</p>
                        </div> */}
                    </div>
                </div>
            </section>
        </main>
    );
};


// --- Main Disclaimer Page Component ---
export default function DisclaimerPage() {
  return <DisclaimerContent />;
}

