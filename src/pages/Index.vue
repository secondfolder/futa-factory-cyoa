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
        {{ neededFuckingAffinity }}
        <div v-if="neededChoresAffinity > 0">
          {{neededChoresAffinity}}  
        </div>
        <div v-if="neededTortureAffinity > 0">
          {{neededTortureAffinity}}  
        </div>
        <div v-if="neededExtraBitsAffinity > 0">
          {{neededExtraBitsAffinity}}  
        </div>
        <div v-if="neededFuckingAffinity > 0">
          {{neededFuckingAffinity}}  
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
    maxPossibleChores () {
      return this.groupCount('Chores', this.subtreeChoices)
    },
    maxPossibleTorture () {
      return this.groupCount('Torture', this.subtreeChoices)
    },
    maxPossibleExtraBits () {
      return this.groupCount('Extra Bits', this.subtreeChoices)
    },
    maxPossibleFucking () {
      return this.groupCount('Fucking', this.subtreeChoices)
    },
    requiredChores () {
      return this.groupCount('Chores', this.subtreeSelected)
    },
    requiredTortureAffinity () {
      return this.groupCount('Torture', this.subtreeSelected)
    },
    requiredExtraBitsAffinity () {
      return this.groupCount('Extra Bits', this.subtreeSelected)
    },
    requiredFuckingAffinity () {
      return this.groupCount('Fucking', this.subtreeSelected)
    },
    neededChoresAffinity () {
      return this.requiredChoresAffinity - this.choresAffinity
    },
    neededTortureAffinity () {
      return this.requiredTortureAffinity - this.tortureAffinity
    },
    neededExtraBitsAffinity () {
      return this.requiredExtraBitsAffinity - this.extraBitsAffinity
    },
    neededFuckingAffinity () {
      return this.requiredFuckingAffinity - this.fuckingAffinity
    },
    choresAffinity () {
      return this.affinityCount('choresAffinity')
    },
    tortureAffinity () {
      return this.affinityCount('tortureAffinity')
    },
    extraBitsAffinity () {
      return this.affinityCount('extraBitsAffinity')
    },
    fuckingAffinity () {
      return this.affinityCount('fuckingAffinity')
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
      const choresGroup = this.choiceGroups.find(choice => choice.title === title)
      return this.subtreeChoices(choresGroup).length
    },
    requiredAffinity (title) {
      const choresGroup = this.choiceGroups.find(choice => choice.title === title)
      return this.subtreeSelected(choresGroup).length
    }
    groupCount (title, choices) {
      const choresGroup = this.choiceGroups.find(choice => choice.title === title)
      return choices(choresGroup).length
    },
    affinityCount (affinityProp) {
      return this
        .selected
        .reduce(
          (runningTotal, choice) => runningTotal + (choice[affinityProp] || 0)
          , 0
        )
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