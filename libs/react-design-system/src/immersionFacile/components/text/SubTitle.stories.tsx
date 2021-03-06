import { ArgTypes, ComponentMeta, ComponentStory } from "@storybook/react";
import React from "react";
import { textPrefix } from ".";
import { SubTitle } from "./SubTitle";
import { TitleProps } from "./Title";

const Component = SubTitle;
const argTypes: Partial<ArgTypes<TitleProps>> | undefined = {};

export default {
  title: `${textPrefix}${Component.name}`,
  component: Component,
  argTypes,
} as ComponentMeta<typeof Component>;

const componentStory: ComponentStory<typeof Component> = (args) => (
  <Component {...args} />
);

export const Default = componentStory.bind({});
Default.args = {
  children: "Default",
};
