import { ArgTypes, ComponentMeta, ComponentStory } from "@storybook/react";
import React from "react";
import { inputPrefix } from ".";
import { TextArea, TextAreaProperties } from "./TextArea";

const Component = TextArea;
const argTypes: Partial<ArgTypes<TextAreaProperties>> | undefined = {};

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
  name: "Default",
  value: "Default Value",
};
