import { videoInterviewQuestions } from "@/lib/site";

/** Staff-triggered, one candidate at a time -- shown only once an
 * applicant is scheduled for interview, not sent automatically to
 * everyone who applies. */
export default function VideoInterviewRequestButton({
  phone,
  fullName,
  jobPostingTitle,
}: {
  phone: string;
  fullName: string;
  jobPostingTitle: string;
}) {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return null;

  const questionsList = videoInterviewQuestions.map((q, i) => `${i + 1}. ${q}`).join("\n");
  const message = `Hi ${fullName}, as part of your interview for the ${jobPostingTitle} position at Cham Business Ltd, please record a short video answering these questions and send it back here on WhatsApp:\n\n${questionsList}\n\nWe look forward to watching it!`;
  const href = `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 rounded-lg border border-line hover:bg-paper-deep text-ink text-sm font-medium px-3 py-1.5 transition-colors"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 7l-7 5 7 5V7z" />
        <rect x="1" y="5" width="15" height="14" rx="2" />
      </svg>
      Request video interview
    </a>
  );
}
