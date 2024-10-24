import React from 'react';
import { Twitter, Instagram, MoonStar, MoonStarIcon, Youtube } from 'lucide-react';

const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <MoonStarIcon className="w-8 h-8" viewBox="0 0 24 24" />
                            <span className="text-2xl font-bold">LuaPDF</span>
                        </div>
                        <p className="text-sm opacity-80">
                            Não somos apenas uma empresa, somos a sua solução! Trazendo confiabilidade e inovação para o mundo dos documentos digitais.
                        </p>
                        <div className="flex items-center space-x-2">
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22 16.92V19.92C22.0011 20.1985 21.9441 20.4742 21.8325 20.7293C21.7209 20.9845 21.5573 21.2136 21.3521 21.4019C21.1469 21.5901 20.9046 21.7335 20.6407 21.8227C20.3769 21.9119 20.0974 21.9451 19.82 21.92C16.7428 21.5856 13.787 20.5341 11.19 18.85C8.77382 17.3147 6.72533 15.2662 5.18999 12.85C3.49997 10.2412 2.44824 7.27099 2.11999 4.18C2.095 3.90347 2.12787 3.62476 2.21649 3.36162C2.30512 3.09849 2.44756 2.85669 2.63476 2.65162C2.82196 2.44655 3.0498 2.28271 3.30379 2.17052C3.55777 2.05833 3.83233 2.00026 4.10999 2H7.10999C7.5953 1.99522 8.06579 2.16708 8.43376 2.48353C8.80173 2.79999 9.04207 3.23945 9.10999 3.72C9.23662 4.68007 9.47144 5.62273 9.80999 6.53C9.94454 6.88792 9.97366 7.27691 9.89384 7.65088C9.81401 8.02485 9.62886 8.36811 9.35999 8.64L8.08999 9.91C9.51355 12.4135 11.5864 14.4864 14.09 15.91L15.36 14.64C15.6319 14.3711 15.9751 14.186 16.3491 14.1061C16.7231 14.0263 17.1121 14.0555 17.47 14.19C18.3773 14.5286 19.3199 14.7634 20.28 14.89C20.7658 14.9585 21.2094 15.2032 21.5265 15.5775C21.8437 15.9518 22.0122 16.4296 22 16.92Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <span>+55 (44) 99107-6690</span>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xl font-semibold mb-4">Recursos</h3>
                        <ul className="space-y-">
                            {['Home', 'Plano Pro: Sua jornada para a Lua começa aqui!', 'Descubra como dominar o LuaPDF'].map((item, index) => (
                                <li key={index}>
                                    <a href="#" className="hover:text-blue-200 transition-colors duration-300">{item}</a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-xl font-semibold mb-4">Companhia</h3>
                        <ul className="space-y-2">
                            {['Conheça nossa história', 'Contato & Suporte', 'Termos de Privacidade'].map((item, index) => (
                                <li key={index}>
                                    <a href="pdfly\src\pages\ContactAndSupport\page.tsx" className="hover:text-blue-200 transition-colors duration-300">{item}</a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-xl font-semibold mb-4">Links Rápidos</h3>
                        <ul className="space-y-2">
                            {['Instagram', 'Twitter', 'Youtube'].map((item, index) => (
                                <li key={index}>
                                    <a href="#" className="hover:text-blue-200 transition-colors duration-300">{item}</a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-blue-400 flex flex-col md:flex-row justify-between items-center">
                    <p>&copy; {currentYear} LuaPDF. Todos os direitos reservados.</p>
                    <div className="flex space-x-4 mt-4 md:mt-0">
                        {[
                            { Icon: Twitter, href: '#' },
                            { Icon: Instagram, href: '#' },
                            { Icon: Youtube, href: '#' },
                        ].map(({ Icon, href }, index) => (
                            <a
                                key={index}
                                href={href}
                                className="text-white hover:text-blue-200 transition-colors duration-300"
                            >
                                <Icon size={24} />
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;