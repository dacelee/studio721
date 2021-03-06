import * as RadixDropdownMenu from '@radix-ui/react-dropdown-menu';
import { CheckIcon, ChevronRightIcon } from '@radix-ui/react-icons';
import { SpacerHorizontal } from 'components';
import { useKeyboardShortcuts } from 'keymap';
import React, { memo, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { MenuItemProps, MenuProps } from './ContextMenu';
import {
  CHECKBOX_RIGHT_INSET,
  CHECKBOX_WIDTH,
  getKeyboardShortcutsForMenuItems,
  KeyboardShortcut,
  SEPARATOR_ITEM,
  styles,
} from './internal/Menu';

/* ----------------------------------------------------------------------------
 * Separator
 * ------------------------------------------------------------------------- */

const SeparatorElement = styled(RadixDropdownMenu.Separator)(
  styles.separatorStyle,
);

/* ----------------------------------------------------------------------------
 * Item
 * ------------------------------------------------------------------------- */

const ItemElement = styled(RadixDropdownMenu.Item)(styles.itemStyle);

const CheckboxItemElement = styled(RadixDropdownMenu.CheckboxItem)(
  styles.itemStyle,
);

const StyledItemIndicator = styled(RadixDropdownMenu.ItemIndicator)(
  styles.itemIndicatorStyle,
);

const DropdownMenuItem = memo(function ContextMenuItem<T extends string>({
  value,
  children,
  onSelect,
  checked,
  disabled,
  indented,
  icon,
  items,
  shortcut,
}: MenuItemProps<T>) {
  const handleSelectItem = useCallback(() => {
    if (!value) return;

    onSelect(value);
  }, [onSelect, value]);

  if (checked) {
    return (
      <CheckboxItemElement
        checked={checked}
        disabled={disabled}
        onSelect={handleSelectItem}
      >
        <StyledItemIndicator>
          <CheckIcon />
        </StyledItemIndicator>
        {children}
      </CheckboxItemElement>
    );
  }

  const element = (
    <ItemElement disabled={disabled} onSelect={handleSelectItem}>
      {indented && (
        <SpacerHorizontal size={CHECKBOX_WIDTH - CHECKBOX_RIGHT_INSET} />
      )}
      {icon && (
        <>
          {icon}
          <SpacerHorizontal size={8} />
        </>
      )}
      {children}
      {shortcut && (
        <>
          <SpacerHorizontal />
          <SpacerHorizontal size={24} />
          <KeyboardShortcut shortcut={shortcut} />
        </>
      )}
      {items && items.length > 0 && (
        <>
          <SpacerHorizontal />
          <SpacerHorizontal size={16} />
          <ChevronRightIcon />
        </>
      )}
    </ItemElement>
  );

  if (items && items.length > 0) {
    return (
      <DropdownMenuRoot isNested items={items} onSelect={onSelect}>
        {element}
      </DropdownMenuRoot>
    );
  } else {
    return element;
  }
});

/* ----------------------------------------------------------------------------
 * Root
 * ------------------------------------------------------------------------- */

const RootElement = styled(RadixDropdownMenu.Content)(styles.contentStyle);

function DropdownMenuRoot<T extends string>({
  items,
  children,
  onSelect,
  isNested,
  shouldBindKeyboardShortcuts,
}: MenuProps<T>) {
  const hasCheckedItem = items.some(
    (item) => item !== SEPARATOR_ITEM && item.checked,
  );

  const keymap = useMemo(
    () =>
      isNested || shouldBindKeyboardShortcuts === false
        ? {}
        : getKeyboardShortcutsForMenuItems(items, onSelect),
    [isNested, items, onSelect, shouldBindKeyboardShortcuts],
  );

  useKeyboardShortcuts(keymap);

  return (
    <RadixDropdownMenu.Root>
      {isNested ? (
        <RadixDropdownMenu.TriggerItem asChild>
          {children}
        </RadixDropdownMenu.TriggerItem>
      ) : (
        <RadixDropdownMenu.Trigger asChild>
          {children}
        </RadixDropdownMenu.Trigger>
      )}
      <RootElement
        scrollable={true}
        sideOffset={4}
        onCloseAutoFocus={useCallback((event) => {
          // Prevent the trigger from being focused, which interferes with
          // keyboard shortcuts going to the canvas
          event.preventDefault();

          // Workaround radix-ui issue where all pointerEvents become blocked
          // until the body is clicked again
          document.body.style.pointerEvents = '';
        }, [])}
      >
        {items.map((item, index) =>
          item === SEPARATOR_ITEM ? (
            <SeparatorElement key={index} />
          ) : (
            <DropdownMenuItem
              key={item.value ?? index}
              value={item.value}
              indented={hasCheckedItem}
              checked={item.checked ?? false}
              disabled={item.disabled ?? false}
              icon={item.icon}
              onSelect={onSelect}
              items={item.items}
              shortcut={item.shortcut}
            >
              {item.title}
            </DropdownMenuItem>
          ),
        )}
      </RootElement>
    </RadixDropdownMenu.Root>
  );
}

export default memo(DropdownMenuRoot);
