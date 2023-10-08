import { useLocalStorage } from "@mantine/hooks";
import { useEffect, useState } from "react";
import type { RouterOutputs } from "@/utils/api";
import { api } from "@/utils/api";

const userAPI = api.user;

type UserConfiguration = NonNullable<RouterOutputs["user"]["getConfiguration"]>;

type UserConfigurationHookProps = {
  uid: string;
};

const useUserConfiguration = ({ uid }: UserConfigurationHookProps) => {
  const [colorScheme, setColorScheme] = useLocalStorage({
    key: "user-theme",
    defaultValue: {
      theme: "sky",
      lightTheme: "light",
    },
  });

  const [userConfiguration, setUserConfiguration] = useState<UserConfiguration>(
    { ...colorScheme, id: "", name: "" }
  );

  const { data } = userAPI.getConfiguration.useQuery(
    { uid },
    { enabled: !!uid }
  );

  useEffect(() => {
    if (data) {
      setUserConfiguration(data);
      setColorScheme(data);
      console.log("data is", data);
    }
  }, [data, setColorScheme]);

  return userConfiguration;
};

export default useUserConfiguration;
