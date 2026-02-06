import * as React from 'react';

export function useProfileViewModel() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  return {
    isLoading,
    error,
  };
}

export default useProfileViewModel;
