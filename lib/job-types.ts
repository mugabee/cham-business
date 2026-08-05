// Shared types and display labels for the careers feature -- kept separate
// from lib/jobs.ts and lib/job-applicants.ts (both "server-only", DB access)
// so client components can import these constants without pulling in a
// server-only module.

export type EmploymentType = "full_time" | "part_time" | "contract" | "internship";
export type JobPostingStatus = "draft" | "open" | "closed";

export const EMPLOYMENT_TYPE_LABELS: Record<EmploymentType, string> = {
  full_time: "Full-time",
  part_time: "Part-time",
  contract: "Contract",
  internship: "Internship",
};

export type JobPostingSummary = {
  id: number;
  title: string;
  slug: string;
  department: string | null;
  location: string;
  employmentType: EmploymentType;
  summary: string;
  status: JobPostingStatus;
  createdAt: Date;
  applicantCount: number;
};

export type JobPostingDetail = Omit<JobPostingSummary, "applicantCount"> & {
  description: string;
  requirements: string;
  closedAt: Date | null;
};

export type ApplicantStatus =
  | "new"
  | "screening"
  | "interview"
  | "offer"
  | "hired"
  | "rejected";

export const APPLICANT_STATUS_LABELS: Record<ApplicantStatus, string> = {
  new: "New",
  screening: "Screening",
  interview: "Interview",
  offer: "Offer",
  hired: "Hired",
  rejected: "Rejected",
};

// The order candidates normally move through -- used to render the
// pipeline as a straight line rather than an arbitrary status list.
export const APPLICANT_PIPELINE: ApplicantStatus[] = [
  "new",
  "screening",
  "interview",
  "offer",
  "hired",
];

export type JobApplicantSummary = {
  id: number;
  jobPostingId: number;
  fullName: string;
  email: string;
  phone: string;
  status: ApplicantStatus;
  submittedAt: Date;
};

export type JobApplicantDetail = JobApplicantSummary & {
  coverLetter: string | null;
  resumeOriginalFilename: string;
  notes: string | null;
  reviewedByEmail: string | null;
  reviewedAt: Date | null;
  jobPostingTitle: string;
};
