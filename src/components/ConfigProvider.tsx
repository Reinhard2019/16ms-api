import { type ParentProps, type Component, useContext } from "solid-js";
import { ConfigProvider as ConfigProviderAntd, zhCN, enUS } from "antd-solid";
import { getLng } from "src/i18n";

const ConfigProvider: Component<ParentProps> = (props) => {
  return (
    <ConfigProviderAntd theme="dark" locale={getLng() === "en" ? enUS : zhCN}>
      {props.children}
    </ConfigProviderAntd>
  );
};

export default ConfigProvider;
