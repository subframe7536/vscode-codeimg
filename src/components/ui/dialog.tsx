import type { Component, ComponentProps, JSX, ValidComponent } from 'solid-js'
import { splitProps } from 'solid-js'

import * as DialogPrimitive from '@kobalte/core/dialog'
import type { PolymorphicProps } from '@kobalte/core/polymorphic'

import { cn } from '../../utils/base'

const Dialog = DialogPrimitive.Root
const DialogTrigger = DialogPrimitive.Trigger

const DialogPortal: Component<DialogPrimitive.DialogPortalProps> = (props) => {
  const [, rest] = splitProps(props, ['children'])
  return (
    <DialogPrimitive.Portal {...rest}>
      <div class="fixed inset-0 z-50 flex items-start justify-center sm:items-center">
        {props.children}
      </div>
    </DialogPrimitive.Portal>
  )
}

type DialogOverlayProps = DialogPrimitive.DialogOverlayProps & { class?: string | undefined }

function DialogOverlay<T extends ValidComponent = 'div'>(props: PolymorphicProps<T, DialogOverlayProps>) {
  const [, rest] = splitProps(props as DialogOverlayProps, ['class'])
  return (
    <DialogPrimitive.Overlay
      class={cn(
        'fixed inset-0 z-50 bg-background/80 backdrop-blur-sm data-[expanded]:animate-in data-[closed]:animate-out data-[closed]:fade-out-0 data-[expanded]:fade-in-0',
        props.class,
      )}
      {...rest}
    />
  )
}

type DialogContentProps = DialogPrimitive.DialogContentProps & {
  class?: string | undefined
  children?: JSX.Element
}

function DialogContent<T extends ValidComponent = 'div'>(props: PolymorphicProps<T, DialogContentProps>) {
  const [, rest] = splitProps(props as DialogContentProps, ['class', 'children'])
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        class={cn(
          'fixed left-1/2 top-1/2 z-50 grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 border bg-background p-6 shadow-lg duration-200 data-[expanded]:animate-in data-[closed]:animate-out data-[closed]:fade-out-0 data-[expanded]:fade-in-0 data-[closed]:zoom-out-95 data-[expanded]:zoom-in-95 data-[closed]:slide-out-to-left-1/2 data-[closed]:slide-out-to-top-48% data-[expanded]:slide-in-from-left-1/2 data-[expanded]:slide-in-from-top-48% sm:rounded-lg',
          props.class,
        )}
        {...rest}
      >
        {props.children}
        <DialogPrimitive.CloseButton class="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[expanded]:bg-accent data-[expanded]:text-muted-foreground">
          <i class="i-lucide-x" />
          <span class="sr-only">Close</span>
        </DialogPrimitive.CloseButton>
      </DialogPrimitive.Content>
    </DialogPortal>
  )
}

const DialogHeader: Component<ComponentProps<'div'>> = (props) => {
  const [, rest] = splitProps(props, ['class'])
  return (
    <div class={cn('flex flex-col space-y-1.5 text-center sm:text-left', props.class)} {...rest} />
  )
}

const DialogFooter: Component<ComponentProps<'div'>> = (props) => {
  const [, rest] = splitProps(props, ['class'])
  return (
    <div
      class={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', props.class)}
      {...rest}
    />
  )
}

type DialogTitleProps = DialogPrimitive.DialogTitleProps & { class?: string | undefined }

function DialogTitle<T extends ValidComponent = 'h2'>(props: PolymorphicProps<T, DialogTitleProps>) {
  const [, rest] = splitProps(props as DialogTitleProps, ['class'])
  return (
    <DialogPrimitive.Title
      class={cn('text-lg font-semibold leading-none tracking-tight', props.class)}
      {...rest}
    />
  )
}

type DialogDescriptionProps = DialogPrimitive.DialogDescriptionProps & {
  class?: string | undefined
}

function DialogDescription<T extends ValidComponent = 'p'>(props: PolymorphicProps<T, DialogDescriptionProps>) {
  const [, rest] = splitProps(props as DialogDescriptionProps, ['class'])
  return (
    <DialogPrimitive.Description
      class={cn('text-sm text-muted-foreground', props.class)}
      {...rest}
    />
  )
}

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
