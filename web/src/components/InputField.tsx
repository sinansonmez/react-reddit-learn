import React, {FunctionComponent, InputHTMLAttributes} from 'react';
import {useField} from "formik";
import {FormControl, FormErrorMessage, FormLabel, Input, Textarea} from "@chakra-ui/react";

type OwnProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  name: string;
  type?: string;
  textarea?: boolean;
};
// size is causing the error, with _ we can ignore it from props
const InputField: FunctionComponent<OwnProps> = ({label, textarea, size: _, ...props}) => {
  let InputOrTextArea = textarea ? Textarea : Input
  const [field, {error}] = useField(props)
  // @ts-ignore
  return (
    <FormControl isInvalid={!!error}>
      <FormLabel htmlFor={field.name}>{label}</FormLabel>
      <InputOrTextArea {...field} {...props} id={field.name}/>
      {error ? <FormErrorMessage>{error}</FormErrorMessage> : null}
    </FormControl>
  );
};

export default InputField;
