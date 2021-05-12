import { Args as DefaultArgs, Annotations, BaseStory } from '@storybook/addons';

export declare type Story<Args = DefaultArgs> = BaseStory<Args, HTMLReturnType> &
  Annotations<Args, HTMLReturnType>;
