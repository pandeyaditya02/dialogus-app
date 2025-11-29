"use client";

import { useState, useEffect } from "react";
import { Share2, Link as LinkIcon, Twitter, Linkedin, Facebook, X } from "lucide-react";

interface ShareButtonProps {
    title: string;
    text: string;
    url?: string; // Optional, defaults to current window location
}

export default function ShareButton({ title, text, url }: ShareButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [shareUrl, setShareUrl] = useState(url || "");
    const [showCopied, setShowCopied] = useState(false);

    useEffect(() => {
        if (!url && typeof window !== "undefined") {
            setShareUrl(window.location.href);
        }
    }, [url]);

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title,
                    text,
                    url: shareUrl,
                });
            } catch (error) {
                console.error("Error sharing:", error);
            }
        } else {
            setIsOpen(!isOpen);
        }
    };

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setShowCopied(true);
            setTimeout(() => setShowCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };

    const socialLinks = [
        {
            name: "Twitter",
            icon: Twitter,
            href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`,
            color: "hover:text-sky-400",
        },
        {
            name: "LinkedIn",
            icon: Linkedin,
            href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
            color: "hover:text-blue-500",
        },
        {
            name: "Facebook",
            icon: Facebook,
            href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
            color: "hover:text-blue-600",
        },
    ];

    return (
        <div className="relative inline-block text-left">
            <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 bg-fuchsia-600 hover:bg-fuchsia-700 text-white rounded-full transition-colors duration-200 font-medium shadow-lg hover:shadow-fuchsia-500/25"
                aria-label="Share this post"
            >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
            </button>

            {/* Fallback Dropdown for Desktop/Non-native share */}
            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 rounded-xl bg-gray-900 border border-gray-700 shadow-xl z-50 p-2 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                        <div className="flex justify-between items-center px-3 py-2 border-b border-gray-800 mb-1">
                            <span className="text-sm font-semibold text-gray-300">Share via</span>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-gray-500 hover:text-gray-300"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="space-y-1">
                            {socialLinks.map((link) => (
                                <a
                                    key={link.name}
                                    href={link.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors ${link.color}`}
                                    onClick={() => setIsOpen(false)}
                                >
                                    <link.icon className="w-4 h-4" />
                                    <span className="text-sm">{link.name}</span>
                                </a>
                            ))}

                            <button
                                onClick={copyToClipboard}
                                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors hover:text-green-400"
                            >
                                <LinkIcon className="w-4 h-4" />
                                <span className="text-sm">
                                    {showCopied ? "Copied!" : "Copy Link"}
                                </span>
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
