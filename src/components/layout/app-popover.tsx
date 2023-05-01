import { Popover as HeadlessUiPopover, Transition } from "@headlessui/react";
import ChevronDownIcon from "@heroicons/react/20/solid/ChevronDownIcon";
import classnames from "classnames";
import { Fragment, useState } from "react";
import { usePopper } from "react-popper";

type Props = {
  buttonText: React.ReactNode | string;
  children: React.ReactNode;
  className?: string;
};

export const AppPopover: React.FC<Props> = ({
  buttonText,
  children,
  className,
}) => {
  const [referenceElement, setReferenceElement] =
    useState<HTMLElement | null>();
  const [popperElement, setPopperElement] = useState<HTMLElement | null>();
  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    modifiers: [
      {
        name: "preventOverflow",
        options: {
          padding: 15,
        },
      },
      {
        name: "computeStyles",
        options: {
          adaptive: true,
        },
      },
    ],
  });

  return (
    <HeadlessUiPopover>
      <HeadlessUiPopover.Button
        ref={setReferenceElement}
        className={classnames(
          "group inline-flex justify-center text-sm font-medium text-gray-700 hover:text-gray-900",
          className
        )}
      >
        {buttonText}

        <ChevronDownIcon
          className="-mr-1 ml-1 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-500"
          aria-hidden="true"
        />
      </HeadlessUiPopover.Button>

      <Transition
        as={Fragment}
        enter="ease-out duration-200"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="ease-in duration-150"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <HeadlessUiPopover.Panel
          ref={setPopperElement}
          style={styles.popper}
          className="rounded-md bg-white p-4 shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none"
          {...attributes.popper}
        >
          {children}
        </HeadlessUiPopover.Panel>
      </Transition>
    </HeadlessUiPopover>
  );
};
