"use client";

import { ValidationResult } from "@/types/bulk";

import ValidationCard from "../ValidationCard";
import ValidationSummary from "../ValidationSummary";
import ValidationDetails from "../ValidationDetails";

type Props = {
  currentStep: number;

  loading: boolean;

  validationResult: ValidationResult | null;

  onValidate: () => void;

  onContinue: () => void;
};

export default function Step3Validation({
  currentStep,
  loading,
  validationResult,
  onValidate,
  onContinue,
}: Props) {

  if (currentStep !== 3) {
    return null;
  }

  return (
    <>

      <ValidationCard
        loading={loading}
        onValidate={onValidate}
      />

      {validationResult && (
        <>
          <ValidationSummary
            result={validationResult}
            onContinue={onContinue}
          />

          <ValidationDetails
            result={validationResult}
          />
        </>
      )}

    </>
  );
}