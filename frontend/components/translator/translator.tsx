import React from 'react'
import {useEffect, useRef, useState} from 'react'
import { Languages } from 'lucide-react'

function Translator() {
    const scriptLoaded = useRef(false);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        if (scriptLoaded.current) return;
        
        const script = document.createElement('script');
        script.src='https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
        script.async = true;
        document.body.appendChild(script);
        
        window.googleTranslateElementInit = () => {
            if (document.getElementById('google_translate_element')) {
                new google.translate.TranslateElement({
                    pageLanguage: 'en',
                    includedLanguages: "en,hi,ta,te,bn,ml,gu,kn",
                    layout: google.translate.TranslateElement.InlineLayout.SIMPLE
                }, 'google_translate_element');
                
                setTimeout(() => {
                    const translateElement = document.querySelector('.goog-te-gadget');
                    if (translateElement) {
                        translateElement.style.cssText = `
                            background: transparent !important;
                            border: none !important;
                            font-family: inherit !important;
                            width: 100% !important;
                            margin: 0 !important;
                        `;
                        
                        const selectElement = translateElement.querySelector('select');
                        if (selectElement) {
                            selectElement.style.cssText = `
                                background: hsl(var(--background)) !important;
                                border: 1px solid hsl(var(--border)) !important;
                                border-radius: 6px !important;
                                padding: 8px 12px !important;
                                font-size: 14px !important;
                                color: hsl(var(--foreground)) !important;
                                cursor: pointer !important;
                                transition: all 0.2s ease !important;
                                width: 100% !important;
                                min-width: 160px !important;
                                max-width: 200px !important;
                            `;
                            
                            selectElement.addEventListener('mouseenter', () => {
                                selectElement.style.borderColor = 'hsl(var(--primary))';
                                selectElement.style.boxShadow = '0 0 0 2px hsl(var(--primary) / 0.2)';
                            });
                            
                            selectElement.addEventListener('mouseleave', () => {
                                selectElement.style.borderColor = 'hsl(var(--border))';
                                selectElement.style.boxShadow = 'none';
                            });
                        }
                    }
                }, 100);
            }
        }
        
        scriptLoaded.current = true;
        
        return () => {
            if (script.parentNode) {
                script.parentNode.removeChild(script);
            }
        }
    }, [])
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);
    
    return (
        <div ref={dropdownRef} className="relative z-50">
            <div 
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-background hover:bg-muted/50 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md min-w-fit"
                onClick={() => setIsOpen(!isOpen)}
            >
                <Languages className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors flex-shrink-0" />
                <span className="text-sm font-medium text-foreground hover:text-primary transition-colors whitespace-nowrap">
                    Select your Language
                </span>
            </div>
            <div 
                className={`absolute top-full right-0 mt-2 transition-all duration-200 z-50 bg-background border border-border rounded-lg shadow-lg p-3 min-w-[200px] ${
                    isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                }`}
            >
                <div id='google_translate_element' className="w-full" />
            </div>
        </div>
    )
}

export default Translator
