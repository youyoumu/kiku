/**
 * @import { KikuPlugin } from "#/plugins/pluginTypes";
 */

/**
 * @type { KikuPlugin }
 */
export const plugin = {
  Pitch: (props) => {
    const h = props.ctx.h;
    const onMount = props.ctx.onMount;
    const createSignal = props.ctx.createSignal;
    const DefaultPitch = props.DefaultPitch;
    const pitchInfo = props.pitchInfo;

    const color = () => {
      // you can customize the color here
      switch (pitchInfo.pitchNum) {
        case 0:
          return { color: "#d46a6a", colorContent: "#8b3f3f" };
        case 1:
          return { color: "#6ad46a", colorContent: "#3f8b3f" };
        case 2:
          return { color: "#6a6ad4", colorContent: "#3f3f8b" };
        case 3:
          return { color: "#d4d46a", colorContent: "#8b8b3f" };
        default:
          return { color: "#8b8b8b", colorContent: "#3f3f3f" };
      }
    };

    const css = `
        .custom-pitch {
          color: ${color().color};
          border-color: ${color().color}
        }
        .custom-pitch::after {
          background-color: ${color().color};
        }
      `;
    const style = h("style", css);

    const [ref, setRef] = createSignal();
    onMount(() => {
      const el = ref();
      if (!el) return;

      const spans = Array.from(el.querySelectorAll("[data-is-even] span"));
      spans.forEach((span) => {
        span.classList.add("custom-pitch");
      });

      const indicator = el.querySelector("[data-is-even]")?.nextElementSibling;
      indicator.style.backgroundColor = color()?.color;
      indicator.style.color = color()?.colorContent;
    });

    return [
      DefaultPitch({
        index: props.index,
        pitchInfo: props.pitchInfo,
        ref: setRef,
      }),
      style(),
    ];
  },
};
