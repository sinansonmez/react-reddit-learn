import React, { FunctionComponent, InputHTMLAttributes } from 'react';
import { useField } from "formik";
import { FormControl, FormErrorMessage, FormLabel, Input } from "@chakra-ui/react";

type OwnProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  name: string;
  type?: string;
};
// size is causing the error, with _ we can ignore it from props
const InputField: FunctionComponent<OwnProps> = ({label, size: _, ...props}) => {
  const [field, {error}] = useField(props)
  return (
    <FormControl isInvalid={!!error}>
      <FormLabel htmlFor={field.name}>{label}</FormLabel>
      <Input {...field} {...props} id={field.name}/>
      {error ? <FormErrorMessage>{error}</FormErrorMessage> : null}
    </FormControl>
  );
};

export default InputField;
