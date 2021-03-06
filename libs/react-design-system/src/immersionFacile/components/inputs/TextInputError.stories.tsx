import { ArgTypes, ComponentMeta, ComponentStory } from "@storybook/react";
import React from "react";
import { inputPrefix } from ".";
import { TextInputError, TextInputErrorProperties } from "./TextInputError";

const Component = TextInputError;
const argTypes: Partial<ArgTypes<TextInputErrorProperties>> | undefined = {};

export default {
  title: `${inputPrefix}${Component.name}`,
  component: Component,
  argTypes,
} as ComponentMeta<typeof Component>;

const componentStory: ComponentStory<typeof Component> = (args) => (
  <Component {...args} />
);

export const Default = componentStory.bind({});
Default.args = {
  errorMessage: "Error message.",
};
