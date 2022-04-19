<template>
  <div class="d-flex justify-content-end align-items-center pb-1">
    <div class="text-left me-2">{{ expression.language.name }}</div>
    <div>
      <input class="me-2"
             style="max-width: 200px"
             v-if="!expression.language.isPractice"
             type="text"
             :value="expression.text" disabled/>
      <input class="me-2" v-else
             style="max-width: 200px"
             type="text"
             v-model="typed"
             :disabled="isFullMatch"
             :class="{'partial-match': isPartialMatch(),
                       'full-match': isFullMatch,
                       'no-match': isNoMatch(),
                       }"/>
      <input class="btn btn-sm btn-primary" type="button"
             :disabled="!expression.language.isPractice"
             value="Hint" @click="hint()">
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';

export default defineComponent({
	name: 'PracticeRow',
	props: {
		// TODO: This should be Expression
		expression: {} as any,
	},
	data() {
		return {
			typed: '',
			isFullMatch: false,
		};
	},
	methods: {
		isPartialMatch() {
			const typedWord = this.typed;
			const firstLettersMatch = this.checkFirstLettersMatch(this.expression.text, typedWord);
			if (firstLettersMatch) {
				if (typedWord.length > 0 && typedWord.length === this.expression.text.length) {
					this.isFullMatch = true;
					return false;
				}
				return true;
			}
			return false;
		},
		isNoMatch() {
			return !this.checkFirstLettersMatch(this.expression.text, this.typed);
		},
		checkFirstLettersMatch(textToMatch: string, typedWord: string) {
			if (typedWord as unknown === undefined) {
				return false;
			}
			let i = 0;
			while (i < typedWord.length) {
				if (textToMatch.charAt(i) === typedWord.charAt(i)) {
					i += 1;
				} else {
					return false;
				}
			}
			return true;
		},
		hint() {
			let j = 0;
			while (j < this.typed.length && this.expression.text.charAt(j) === this.typed.charAt(j)) {
				j += 1;
			}
			if (j > 0) {
				if (this.expression.text[j + 1] === ' ') {
					this.typed = this.expression.text.substring(0, j + 2);
				} else {
					this.typed = this.expression.text.substring(0, j + 1);
				}
			} else {
				this.typed = this.expression.text.substring(0, 1);
			}
		},
	},
},
);
</script>

<style scoped>

.partial-match {
  color: darkgreen;
}

.full-match {
  background: darkgreen;
  color: #fff;
  font-weight: bold;
}

.no-match {
  color: darkred;
}
</style>
