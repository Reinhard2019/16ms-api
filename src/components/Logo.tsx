import { A } from "@solidjs/router";
import { mergeProps, type Component } from "solid-js";

interface LogoProps {
  size?: string;
}

const Logo: Component<LogoProps> = (_props) => {
  const props = mergeProps(
    {
      size: "36px",
    },
    _props,
  );
  return (
    <A href="/">
      <img
        src="/logo.png"
        style={{
          width: props.size,
          height: props.size,
        }}
      />
    </A>
  );
};

export default Logo;
