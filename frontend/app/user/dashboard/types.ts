export interface Job {
    id: number;
    initials: string;
    position: string;
    color: string;
    title: string;
    company: string;
    location: string;
    timeAgo: string;
    type: string;
    tags: string[];
    salary: string;
    description: string;
    whatYoullDo: string[];
    whyCompany: string[];
    recruiter_name?: string;
    recruiter_role?: string;
    recruiter_id?: number;
    user_id?: number;
    posted_by?: number;
}

export interface ApplyFormData {
    fullName: string;
    email: string;
    phone: string;
    linkedin: string;
    coverLetter: string;
    whyInterested: string;
    experience: string;
}

export const DATE_FILTERS = ["All Time", "Today", "This Week", "This Month"];

export const APPLY_STEPS = [
    { id: 1, label: "Info" },
    { id: 2, label: "Resume" },
    { id: 3, label: "Q&A" },
    { id: 4, label: "Review" },
];
