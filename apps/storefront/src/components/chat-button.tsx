/** Floating WhatsApp / Messenger buttons (integration `messenger_chat`). */
export function ChatButtons({ whatsapp, messenger, storeName }: { whatsapp?: string; messenger?: string; storeName: string }) {
  if (!whatsapp && !messenger) return null;
  const digits = whatsapp?.replace(/\D/g, "") ?? "";
  const wa = digits ? `https://wa.me/${digits.startsWith("0") ? "88" + digits : digits}?text=${encodeURIComponent(`Hi ${storeName}! I have a question.`)}` : null;
  return (
    <div className="fixed bottom-20 right-4 z-[60] flex flex-col gap-3 md:bottom-6">
      {messenger ? (
        <a href={`https://m.me/${messenger.replace(/^@/, "")}`} target="_blank" rel="noopener noreferrer" aria-label="Chat on Messenger" className="grid size-13 place-items-center rounded-full bg-[#0084ff] text-white shadow-xl transition hover:scale-105">
          <svg viewBox="0 0 24 24" className="size-7 fill-current" aria-hidden>
            <path d="M12 2C6.4 2 2 6.1 2 11.7c0 2.9 1.2 5.5 3.2 7.3v3.5l3.3-1.8c.9.3 2 .4 3 .4h.5c5.6 0 10-4.1 10-9.7S17.6 2 12 2zm1 13-2.5-2.7L5.6 15l5.4-5.7 2.6 2.7 4.8-2.7L13 15z" />
          </svg>
        </a>
      ) : null}
      {wa ? (
        <a href={wa} target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp" className="grid size-13 place-items-center rounded-full bg-[#25d366] text-white shadow-xl transition hover:scale-105">
          <svg viewBox="0 0 24 24" className="size-7 fill-current" aria-hidden>
            <path d="M20.5 3.5A11.8 11.8 0 0 0 1.9 17.6L.3 23.5l6-1.6a11.8 11.8 0 0 0 5.7 1.5c6.5 0 11.8-5.3 11.8-11.8 0-3.1-1.2-6.1-3.3-8.1zM12 21.4c-1.8 0-3.5-.5-5-1.4l-.4-.2-3.6.9 1-3.5-.2-.4a9.8 9.8 0 1 1 8.2 4.6zm5.4-7.3c-.3-.1-1.8-.9-2-1-.3-.1-.5-.1-.7.1l-.9 1.2c-.2.2-.3.2-.6.1a8 8 0 0 1-4-3.5c-.3-.5.3-.5.9-1.6.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4a3.3 3.3 0 0 0-1 2.5c0 1.5 1.1 2.9 1.2 3.1.1.2 2.1 3.2 5.1 4.5 1.9.8 2.6.9 3.6.7.6-.1 1.8-.7 2-1.4.3-.7.3-1.3.2-1.4 0-.2-.2-.3-.5-.4z" />
          </svg>
        </a>
      ) : null}
    </div>
  );
}
