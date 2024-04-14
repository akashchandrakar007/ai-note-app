import { Loader2 } from "lucide-react";
import { Button } from "./ui/button";

const LoadingButton = ({ loading, children, ...props }) => {
  return (
    <Button disabled={props.disabled || loading} {...props}>
      {loading && <Loader2 className="mr-2 h-4 animate-spin" />}
      {children}
    </Button>
  );
};

export default LoadingButton;
