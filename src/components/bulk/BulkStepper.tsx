type BulkStepperProps = {
    currentStep: number;
  };
  
  const steps = [
    {
      number: 1,
      title: "Upload Excel",
      icon: "📄",
    },
    {
      number: 2,
      title: "Upload Images",
      icon: "🖼️",
    },
    {
      number: 3,
      title: "Validation",
      icon: "✔",
    },
    {
      number: 4,
      title: "Preview",
      icon: "📋",
    },
    {
      number: 5,
      title: "Generate",
      icon: "🤖",
    },
  ];
  
  export default function BulkStepper({
    currentStep,
  }: BulkStepperProps) {
    return (
      <div className="rounded-xl bg-white p-8 shadow">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const completed = currentStep > step.number;
            const active = currentStep === step.number;
  
            return (
              <div
                key={step.number}
                className="flex items-center flex-1"
              >
                <div className="flex flex-col items-center">
                  <div
                    className={`
                      flex h-14 w-14 items-center justify-center
                      rounded-full border-2 text-xl font-bold transition
  
                      ${
                        completed
                          ? "border-green-500 bg-green-500 text-white"
                          : active
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "border-gray-300 bg-white text-gray-400"
                      }
                    `}
                  >
                    {completed ? "✓" : step.icon}
                  </div>
  
                  <span
                    className={`
                      mt-3 text-sm font-medium
  
                      ${
                        active
                          ? "text-blue-600"
                          : completed
                          ? "text-green-600"
                          : "text-gray-500"
                      }
                    `}
                  >
                    {step.title}
                  </span>
                </div>
  
                {index !== steps.length - 1 && (
                  <div
                    className={`
                      mx-4 h-1 flex-1 rounded
  
                      ${
                        completed
                          ? "bg-green-500"
                          : "bg-gray-200"
                      }
                    `}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }