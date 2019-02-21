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
      {{ maxPossibleChoresAffinity }}
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
    },
    maxPossibleChoresAffinity () {
      const choresGroup = this.choiceGroups.find(choice => choice.title === 'Chores')
      return this
        .subtreeChoices(choresGroup)
        .length
      const chorseChoices = this
        .subtreeChoices(choresGroup)
        .reduce((runningTotal, choice) => {console.log(runningTotal, choice); return runningTotal + (choice.choresAffinity || 0)}, 0)
      console.log('chores', chorseChoices)
      /*
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
    */
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
    numberOfChoicesInGroup (title) {
      const choresGroup = this.choiceGroups.find(choice => choice.title === 'Chores')
      return this
        .subtreeChoices(choresGroup)
        .length
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