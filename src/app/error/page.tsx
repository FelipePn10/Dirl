import React from 'react';
import { Bird } from 'lucide-react';

const ErrorPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-4">
            <div className="max-w-6xl w-full flex flex-col lg:flex-row items-center">
                {/* Left side - Galaxy Image */}
                <div className="w-full lg:w-1/2 flex justify-center items-center relative mb-6 lg:mb-0">
                    {/* Espaço reservado para imagem */}
                </div>

                {/* Right side - Content */}
                <div className="w-full lg:w-1/2 text-center lg:text-left">
                    <div className="flex justify-center lg:justify-start items-center mb-3">
                        <Bird className="w-10 h-10 text-gray-800 mr-3" />
                        <span className="text-2xl font-bold text-gray-800">DIRL</span>
                    </div>
                    <h1 className="text-6xl lg:text-9xl font-extrabold text-blue-600 mb-6">ERRO...</h1>
                    <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-2 ml-2">Repito, ERRO. Câmbio!</h2>
                    <div className="bg-gray-100 p-6 lg:p-8 rounded-lg mb-4 inline-block shadow-md">
                        <h3 className="text-lg font-bold text-green-600 mb-6 -ml-6">BASE INFORMA:</h3>
                        <p className="text-lg lg:text-xl font-semibold text-gray-700 leading-relaxed -ml-6">
                            Acho que você chegou ao limite do site.
                            <br />
                            A página que você requisitou não foi encontrada.
                        </p>
                    </div>
                    <div>
                        <a
                            href="/"
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xl font-bold py-3 lg:py-4 px-8 lg:px-10 rounded-md transition duration-300 inline-block shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                        >
                            Retornar à página inicial
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ErrorPage;
