import { useEffect, useState } from "react";
import type { RouterOutputs } from "~/utils/api";
import { api } from "~/utils/api";

const userAPI = api.user;

type UserConfiguration = RouterOutputs["user"]["getConfiguration"];

const useUserConfiguration = () => {
  const [userConfiguration, setUserConfiguration] =
    useState<UserConfiguration>();

  const { data } = userAPI.getConfiguration.useQuery();
  useEffect(() => {
    if (data) {
      setUserConfiguration(data);
    }
  }, [data]);

  if (!userConfiguration) {
    return {
      theme: "dark",
      lightTheme: "light",
    };
  }

  return userConfiguration;
};

export default useUserConfiguration;
