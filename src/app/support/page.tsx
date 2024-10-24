"use client"

import React, { useState } from "react";

const ContactAndSupport = () => {
    const [activeTab, setActiveTab] = useState("email");

    const empresaEmail = "contato@empresa.com";

    const handleSubmitEmail = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        alert("E-mail enviado!");
    };

    return (
        <main className="mx-auto max-w-7xl mb:p-10">
            <div className="mt-8 flex items-start pb-5 sm:items-center sm:gap-0">
                <h1 className="mb-3 ml-1 font-bold text-5xl text-gray-900">Entre em contato conosco</h1>
            </div>

            <div className="flex justify-center mt-8">
                <button
                    onClick={() => setActiveTab("email")}
                    className={`py-2 px-4 border-b-2 ${activeTab === "email" ? "border-blue-500 text-blue-500" : "border-transparent"}`}
                >
                    Email
                </button>
                <button
                    onClick={() => setActiveTab("whatsapp")}
                    className={`py-2 px-4 border-b-2 ${activeTab === "whatsapp" ? "border-blue-500 text-blue-500" : "border-transparent"}`}
                >
                    WhatsApp
                </button>
            </div>
            {activeTab === "email" ? (
                <div className="mt-10">
                    <form onSubmit={handleSubmitEmail} className="max-w-lg mx-auto bg-gray-100 p-6 rounded-md shadow-md">
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Seu e-mail:</label>
                            <input
                                type="email"
                                name="from"
                                className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                                placeholder="seu-email@dominio.com"
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Destinatário (e-mail da empresa):</label>
                            <input
                                type="email"
                                name="to"
                                className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                                value={empresaEmail}
                                readOnly
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Assunto:</label>
                            <input
                                type="text"
                                name="subject"
                                className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                                placeholder="Título do e-mail"
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Mensagem:</label>
                            <textarea
                                name="message"
                                className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                                rows={4}
                                placeholder="Escreva sua mensagem aqui..."
                                required
                            ></textarea>
                        </div>

                        <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600">
                            Enviar
                        </button>
                    </form>
                </div>
            ) : (
                <div className="mt-10 text-center">
                    <p className="text-lg">Clique no botão abaixo para entrar em contato pelo WhatsApp:</p>
                    <a
                        href="https://wa.me/seuNumeroWhatsapp"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block bg-blue-500 text-white py-2 px-4 mt-4 rounded-md hover:bg-blue-600"
                    >
                        Enviar mensagem pelo WhatsApp
                    </a>
                </div>
            )}
        </main>
    );
};

export default ContactAndSupport;
