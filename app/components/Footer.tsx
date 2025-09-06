import { Youtube, Twitter, Linkedin } from 'lucide-react';

const Footer = () => {
    return (
        <footer id="contact" className="bg-gradient-to-t from-black to-gray-900/50 border-t border-gray-800">
            <div className="container mx-auto px-6 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-sm">
                    {/* Column 1: About Us */}
                    <div className="md:col-span-2 lg:col-span-1">
                        <h3 className="text-lg font-bold text-white mb-4">Dialogus</h3>
                        <p className="text-gray-400 max-w-xs leading-relaxed">
                            Dialogus is a digital media platform bringing clarity in a noisy world. We cover politics, business, law, and culture with data-driven analysis and storytelling.
                        </p>
                    </div>

                    {/* Column 2: Quick Links */}
                    <div>
                        <h3 className="text-lg font-bold text-white mb-4">Quick Links</h3>
                        <ul className="space-y-3">
                            <li><a href="/about" className="footer-link">About Us</a></li>
                            <li><a href="/disclaimer" className="footer-link">Disclaimer</a></li>
                            <li><a href="#" className="footer-link">Privacy Policy</a></li>
                            <li><a href="#" className="footer-link">Terms of Service</a></li>
                        </ul>
                    </div>

                    {/* Column 3: Social Media */}
                    <div>
                        <h3 className="text-lg font-bold text-white mb-4">Follow Us</h3>
                        <div className="flex space-x-4">
                            <a href="#" className="social-icon"><Youtube size={24} /></a>
                            <a href="#" className="social-icon"><Twitter size={24} /></a>
                            <a href="#" className="social-icon"><Linkedin size={24} /></a>
                        </div>
                    </div>

                    {/* Column 4: CTA */}
                    <div>
                        <h3 className="text-lg font-bold text-white mb-4">Stay Updated</h3>
                        <p className="text-gray-400 mb-4">Subscribe to our newsletter for the latest insights.</p>
                        <a href="#" className="primary-cta text-white font-semibold py-2 px-5 rounded-full inline-block">
                            Subscribe Now
                        </a>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center text-xs">
                    <p className="text-gray-500">Copyright © 2025 Dialogus. All rights reserved.</p>
                    <p className="text-gray-500 mt-2 sm:mt-0">Made with ❤️ by the Dialogus Team</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

