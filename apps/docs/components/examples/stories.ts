/*
 * Every component's stories, imported once.
 *
 * The docs pages render the same stories Storybook shows and the screenshot
 * tests compare, so the three cannot drift: a page that invented its own
 * examples would be a fourth account of the component, and the one nobody
 * runs. The map is written out rather than globbed because the bundler needs
 * the imports to be static.
 */
import * as Avatar from '../../../storybook/stories/components/Avatar.stories'
import * as Badge from '../../../storybook/stories/components/Badge.stories'
import * as Button from '../../../storybook/stories/components/Button.stories'
import * as Callout from '../../../storybook/stories/components/Callout.stories'
import * as Card from '../../../storybook/stories/components/Card.stories'
import * as Checkbox from '../../../storybook/stories/components/Checkbox.stories'
import * as ConfirmDialog from '../../../storybook/stories/components/ConfirmDialog.stories'
import * as Divider from '../../../storybook/stories/components/Divider.stories'
import * as Drawer from '../../../storybook/stories/components/Drawer.stories'
import * as EmptyState from '../../../storybook/stories/components/EmptyState.stories'
import * as IconButton from '../../../storybook/stories/components/IconButton.stories'
import * as Input from '../../../storybook/stories/components/Input.stories'
import * as Menu from '../../../storybook/stories/components/Menu.stories'
import * as Modal from '../../../storybook/stories/components/Modal.stories'
import * as Popover from '../../../storybook/stories/components/Popover.stories'
import * as RadioGroup from '../../../storybook/stories/components/RadioGroup.stories'
import * as Select from '../../../storybook/stories/components/Select.stories'
import * as Spinner from '../../../storybook/stories/components/Spinner.stories'
import * as Tabs from '../../../storybook/stories/components/Tabs.stories'
import * as Textarea from '../../../storybook/stories/components/Textarea.stories'
import * as Toast from '../../../storybook/stories/components/Toast.stories'
import * as Toggle from '../../../storybook/stories/components/Toggle.stories'
import * as Tooltip from '../../../storybook/stories/components/Tooltip.stories'

export const STORIES = {
  Avatar,
  Badge,
  Button,
  Callout,
  Card,
  Checkbox,
  ConfirmDialog,
  Divider,
  Drawer,
  EmptyState,
  IconButton,
  Input,
  Menu,
  Modal,
  Popover,
  RadioGroup,
  Select,
  Spinner,
  Tabs,
  Textarea,
  Toast,
  Toggle,
  Tooltip,
}

export type ComponentName = keyof typeof STORIES
