import { ArgTypes, ComponentMeta, ComponentStory } from "@storybook/react";
import React from "react";
import { textPrefix } from ".";
import { Title, TitleProps } from "./Title";

const Component = Title;
const argTypes: Partial<ArgTypes<TitleProps>> | undefined = {};

export default {
  title: `${textPrefix}${Component.name}`,
  component: Component,
  argTypes,
} as ComponentMeta<typeof Component>;

const template: ComponentStory<typeof Component> = (args) => (
  <Component {...args} />
);

export const Default = template.bind({});
Default.args = {
  children: "Default",
};
