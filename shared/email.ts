export type EmailType =
  | "NEW_CONVENTION_BENEFICIARY_CONFIRMATION"
  | "NEW_CONVENTION_MENTOR_CONFIRMATION"
  | "NEW_CONVENTION_ADMIN_NOTIFICATION"
  | "NEW_CONVENTION_AGENCY_NOTIFICATION"
  | "NEW_CONVENTION_REVIEW_FOR_ELIGIBILITY_OR_VALIDATION"
  | "VALIDATED_CONVENTION_FINAL_CONFIRMATION"
  | "REJECTED_CONVENTION_NOTIFICATION"
  | "CONVENTION_MODIFICATION_REQUEST_NOTIFICATION"
  | "POLE_EMPLOI_ADVISOR_ON_CONVENTION_ASSOCIATION"
  | "POLE_EMPLOI_ADVISOR_ON_CONVENTION_FULLY_SIGNED"
  | "MAGIC_LINK_RENEWAL"
  | "NEW_ESTABLISHMENT_CREATED_CONTACT_CONFIRMATION"
  | "BENEFICIARY_OR_MENTOR_ALREADY_SIGNED_NOTIFICATION"
  | "NEW_CONVENTION_BENEFICIARY_CONFIRMATION_REQUEST_SIGNATURE"
  | "NEW_CONVENTION_MENTOR_CONFIRMATION_REQUEST_SIGNATURE"
  | "CONTACT_BY_EMAIL_REQUEST"
  | "CONTACT_BY_PHONE_INSTRUCTIONS"
  | "CONTACT_IN_PERSON_INSTRUCTIONS"
  | "EDIT_FORM_ESTABLISHMENT_LINK"
  | "SUGGEST_EDIT_FORM_ESTABLISHMENT"
  | "SHARE_DRAFT_CONVENTION_BY_LINK"
  | "CREATE_IMMERSION_ASSESSMENT"
  | "AGENCY_WAS_ACTIVATED";

export type TemplatedEmail = {
  type: EmailType;
  recipients: string[];
  cc: string[];
  params: Record<string, unknown>;
};

export type EmailSentDto = {
  template: TemplatedEmail,
  sentAt: string,
  error?: string
}