<template>
  <div
    :class="[{selected: isSelected(choiceData) && !hideNotSelected}, 'choice', {selectable}]"
    @click="clicked"
  >
    <a v-if="choiceData.imgSource" class="imgSource" :href="choiceData.imgSource" @click.stop target="_blank">Image Source</a>
    <div>
      <img v-if="choiceData.img" :src="imageSRC">
    </div>
    <h1 class="title" v-html="choiceData.title"></h1>
    <div
      class="qty"
      v-if="isSelected(choiceData) && (choiceData.maxSelectable > 1 || choiceData.maxSelectable === undefined)"
      @click.stop
    >
      QTY:
      <strong>{{ qty }}</strong>
      <template v-if="choiceData.maxSelectable > 0"> (max of {{choiceData.maxSelectable}})</template>
      <span
        @click="qty++"
        :class="{disabled: qty >= choiceData.maxSelectable}"
        v-if="selectable"
      >
        ➕
      </span>
      <span
        @click="qty--"
        :class="{disabled: qty <= 1}"
        v-if="selectable"
      >
        ➖
      </span>
    </div>
    <p class="description" v-html="choiceData.description"></p>
    <p :class="['stat', 'price', {cost: choiceData.cost > 0, gain: choiceData.cost < 0, neutral: !choiceData.cost || choiceData.cost === 0}]">
      {{ isNaN(choiceData.cost) || choiceData.cost === 0 ? 'No Stress' : Math.abs(choiceData.cost)+' Stress' }}
    </p>
    <p class="stat" v-if="choiceData.choresAffinity">
      +{{choiceData.choresAffinity}} Affinity for Chores
    </p>
    <p class="stat" v-if="choiceData.tortureAffinity">
      +{{choiceData.tortureAffinity}} Affinity for Torture
    </p>
    <p class="stat" v-if="choiceData.extraBitsAffinity">
      +{{choiceData.extraBitsAffinity}} Affinity for Extra Bits
    </p>
    <p class="stat" v-if="choiceData.fuckingAffinity">
      +{{choiceData.fuckingAffinity}} Affinity for Fucking
    </p>
  </div>
</template>

<script lang="js">
  import deckMixin from '../mixins/deck'

  export default {
    name: 'view-deck-card-choice',
    mixins: [deckMixin],
    props: ['choiceData', 'selectable', 'hideNotSelected'],
    data () {
      return {
      }
    },
    computed: {
      imageSRC () {
        return this.getAssetUrl(this.choiceData.img)
      },
      qty: {
        // getter
        get: function () {
          return this.selected.length
        },
        // setter
        set: function (newValue) {
          var max = this.choiceData.maxSelectable
          if (!this.selectable) return
          if (max > 0 && newValue > max) return
          if (newValue < 0) return
          this.setSelection(this.choiceData, newValue)
        }
      }
    },
    methods: {
      clicked () {
        if (!this.selectable) return
        if (this.isSelected(this.choiceData)) {
          this.qty = 0
        } else {
          this.qty = 1
        }
      }
    }
  }
</script>

<style scoped lang="postcss">
  img {
    max-width: 100%;
  }
  .choice {
    background-color: #ebf4fb;
    /*max-width: 20em;*/
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px;
    border: 1px solid #d6dfe6;
    transition: outline 0.1s, box-shadow 0.1s;
    outline: 0 solid #efdd0d;
  }
  .choice.selectable:hover {
    box-shadow: 0px 0px 1px 1px #efdd0d;
  }
  .title {
    margin: 0;
    //word-break: break-all;
    text-align: center;
  }
  .selected {
    outline: 1em solid #efdd0d;
  }
  .qty {
    user-select: none; // stop accidental selection when clicking qty increments
  }
  .disabled {
    opacity: 0.3;
    pointer-events: none;
  }
  .imgSource {
    color: #7aa1b9;
    text-decoration: none;
    align-self: left;
  }
  .price.gain::before {
    content: 'Gain:';
    color: #217f21;
  }
  .price.cost::before {
    content: 'Cost:';
    color: #842323;
  }
  .horizontal {
    width: 100%;
    display: flex;
    justify-content: space-between;
  }
  .horizontal > * {
    margin: 0.5em 0;
  }

  /* Custom CSS */
  .choice {
    background-color: unset;
  }
  .price::before {
    margin-right: -0.2em;
  }
  .price.gain::before {
    content: '-';
  }
  .price.gain {
    color: #217f21;
  }
  .price.cost::before {
    content: '+';
  }
  .price.cost {
    color: #842323;
  }
  .stat {
    display: block;
    margin: 0;
    font-weight: bold;
  }
  /deep/ .task {
    color: #1f1fec;
    font-weight: bold;
  }
  .selected {
    outline: 0.3em solid #efdd0d;
  }
</style>
