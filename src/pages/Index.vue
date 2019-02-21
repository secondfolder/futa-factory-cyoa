<template>
  <div id="page" :class="view + 'View'">
    <main>
      <view-deck-flat
        v-if="view === 'flat'"
        :groupData="deckData"
        :selectable="true"
        :level="1"
        @selectionChanged="setSelection"
      />
      <view-deck-card-group
        v-else
        :groupData="deckData"
        :level="1"
        :selectable="true"
        @selectionChanged="setSelection"
      />
    </main>
    <footer :class="{overBudget: remaining < 0}">
      <div>
        <div v-if="!$root.creativeMode">
          <span class="remaining">
            Remaining Points: {{ remaining }}
          </span>
          <span class="budget">
            Budget: {{this.$root.budget}} <em>(randomly picked)</em>
          </span>
        </div>
        <div v-else>
          Stress: {{spent}}
        </div>
        <label>
          Creative Fantasy Mode (no budget): 
          <input type="checkbox" v-model="$root.creativeMode">
        </label>
      </div>
      <div>
        <div v-if="unfulfilledAffinity('Chores') > 0">
          Unfulfilled Chores Affinity: {{unfulfilledAffinity('Chores')}}  
          <span v-if="!affinityPossibleToFulfill('Chores')">
            (not possible to fulfill because affinity is too high; +5 Stress)
          </span>
        </div>
        <div v-if="unfulfilledAffinity('Torture') > 0">
          Unfulfilled Torture Affinity: {{unfulfilledAffinity('Torture')}} 
          <span v-if="!affinityPossibleToFulfill('Torture')">
            (not possible to fulfill because affinity is too high; +5 Stress)
          </span>
        </div>
        <div v-if="unfulfilledAffinity('Extra Bits') > 0">
          Unfulfilled Extra Bits Affinity: {{unfulfilledAffinity('Extra Bits')}}  
          <span v-if="!affinityPossibleToFulfill('Extra Bits')">
            (not possible to fulfill because affinity is too high; +5 Stress)
          </span>
        </div>
        <div v-if="unfulfilledAffinity('Fucking') > 0">
          Unfulfilled Fucking Affinity: {{unfulfilledAffinity('Fucking')}}  
          <span v-if="!affinityPossibleToFulfill('Fucking')">
            (not possible to fulfill because affinity is too high; +5 Stress)
          </span>
        </div>
      </div>
      <div v-if="$root.deckDataModified" >
        <button 
          @click="$root.discardDraft"
          class="danger"
        >
          Discard Changes
        </button>
        <button 
          @click="$router.push({name: 'Source'})"
          class="success"
        >
          Save Unsaved Changes
        </button>
        <button 
          @click="$router.push({name: 'Editor'})"
        >
          Continue Editing
        </button>
      </div>
      <div>
        <button 
          @click="toggleView"
          v-text="(this.view === 'card' ? 'Flat' : 'Card') + ' View'"
        />
        <button
          :disabled="!!changeRequiredMsg" 
          @click="confirmChoices"
          v-text="changeRequiredMsg ? changeRequiredMsg : 'Confirm Choices'"
        />
      </div>
    </footer>
  </div>  
</template>

<script>
import ViewDeckCardGroup from '@/components/ViewDeckCardGroup.vue'
import ViewDeckFlat from '@/components/ViewDeckFlat.vue'
import deckMixin from '@/mixins/deck'

export default {
  name: 'Index',
  mixins: [deckMixin],
  props: ['hash'],
  created () {
    if (this.metaDeckData.isIssue) {
      return this.$router.push({name: 'DataDebug'})
    }
  },
  data () {
    return {
      view: 'card'
    }
  },
  computed: {
    spent () {
      const affinityUnfulfillablePenalty = 
        (!affinityPossibleToFulfill('Chores') ? 5 : 0) +
        (!affinityPossibleToFulfill('Torture') ? 5 : 0) +
        (!affinityPossibleToFulfill('Extra Bit') ? 5 : 0) +
        (!affinityPossibleToFulfill('Fucking') ? 5 : 0) +
      return this.selected
        .map(choice => choice.cost || 0)
        .reduce((a, b) => a + b, 0)
    },
    remaining () {
      return this.$root.budget - this.spent
    },
    groupsNeedingMoreSelections () {
      return this.choiceGroups
        .filter(group => group.minSelectable > 0)
        .filter(group => this.subtreeSelected(group) < group.minSelectable)
    },
    changeRequiredMsg () {
      const msgs = []
      if (this.groupsNeedingMoreSelections.length > 0) {
        msgs.push('More Selections Required')
      }
      if (!this.$root.creativeMode && this.remaining < 0) {
        msgs.push('Over Budget')
      }
      return msgs.length > 0 ? msgs.join(' & ') : null
    }
  },
  components: {ViewDeckCardGroup, ViewDeckFlat},
  methods: {
    toggleView () {
      this.view = this.view === 'card' ? 'flat' : 'card'
    },
    confirmChoices () {
      this.$router.push({
        name: 'Share',
        params: {hash: this.getStatusHash()}
      })
    },
    maxPossibleAffinity (title) {
      const propMap = {
        'Chores': 'choresAffinity',
        'Torture': 'tortureAffinity',
        'Extra Bits': 'extraBitsAffinity',
        'Fucking': 'fuckingAffinity'
      }
      const choresGroup = this.choiceGroups.find(choice => choice.title === title)
      console.log(title, propMap[title])
      return this
        .subtreeChoices(choresGroup)
        .reduce(
          (runningTotal, choice) => runningTotal + (choice[propMap[title]] ? 1 - choice[propMap[title]] : 1),
          0
        )
    },
    forfilledAffinity (title) {
      const choresGroup = this.choiceGroups.find(choice => choice.title === title)
      return this.subtreeSelected(choresGroup).length
    },
    unfulfilledAffinity (title) {
      return this.affinity(title) - this.forfilledAffinity(title)
    },
    affinity (title) {
      const propMap = {
        'Chores': 'choresAffinity',
        'Torture': 'tortureAffinity',
        'Extra Bits': 'extraBitsAffinity',
        'Fucking': 'fuckingAffinity'
      }
      return this
        .selected
        .reduce(
          (runningTotal, choice) => runningTotal + (choice[propMap[title]] || 0),
          0
        )
    },
    affinityPossibleToFulfill (title) {
      console.log( this.affinity(title), this.maxPossibleAffinity(title))
      return this.affinity(title) <= this.maxPossibleAffinity(title)
    }
  }
}
</script>

<style scoped lang="scss">
  @import '../mixins/deck.scss';
  @import '../mixins/ui.scss';
  
  /* Custom CSS */
  /* ... */
  .remaining {
    margin-right: 0.7em;
  }
</style>