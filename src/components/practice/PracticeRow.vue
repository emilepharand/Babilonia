<template>
  <div class="d-flex justify-content-end align-items-center">
    <div class="text-left me-2">{{ expression.language.name }}</div>
    <div class="input-group input-group-md" style="width: 400px">
      <input v-if="!expression.language.isPractice"
             class="form-control"
             type="text"
             :value="expression.text" disabled/>
      <input v-else
             ref="textInput"
             class="form-control"
             type="text"
             v-model="typed"
             @keydown.up.prevent="this.$emit('focusPrevious', rowOrder)"
             @keyup.down="this.$emit('focusNext', rowOrder)"
             @keyup.delete="currentMaxLength"
             @focus="this.$emit('focusedRow', rowOrder)"
             :maxlength="this.currentMaxLength"
             :disabled="isFullMatch"
             :class="{'partial-match': isPartialMatch,
                       'full-match': isFullMatch,
                       'no-match': isNoMatch,
                       'neutral': nothingTyped,
                       }"/>
        <button class="btn btn-outline-dark"
               :disabled="buttonsDisabled()"
               value="Hint" @click="hint()">Hint</button>
        <button class="btn btn-outline-dark"
               :disabled="buttonsDisabled()"
               @click="show()">Show</button>
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
		rowOrder: Number,
		isFocused: Boolean,
		startInteractive: Boolean,
	},
	emits: ['fullMatched', 'skipFocus', 'focusNext', 'focusPrevious', 'focusedRow'],
	data() {
		return {
			typed: '',
			isFullMatch: false,
			isPartialMatch: false,
			isNoMatch: false,
			nothingTyped: true,
			moreLettersAllowed: true,
			currentMaxLength: 1,
		};
	},
	mounted() {
		if (this.isFocused) {
			if (this.$refs.textInput) {
				this.focusInput();
			}
		}
	},
	watch: {
		expression: {
			handler() {
				if (this.expression.language.isPractice) {
					this.typed = '';
					this.isFullMatch = false;
				}
			},
			immediate: true,
		},
		isFocused: {
			handler() {
				if (this.startInteractive && this.isFocused) {
					if (this.isFullMatch || !this.expression.language.isPractice) {
						this.$emit('skipFocus');
					} else if (this.$refs.textInput) {
						this.focusInput();
					}
				}
			},
			immediate: true,
		},
		typed: {
			handler() {
				if (this.startInteractive) {
					if (this.isFullMatch) {
						this.$emit('skipFocus');
					} else {
						this.checkMatch();
					}
				}
			},
		},
	},
	methods: {
		focusInput() {
			(this.$refs.textInput as any).focus();
			const saved = this.typed;
			(this.$refs.textInput as any).value = '';
			(this.$refs.textInput as any).value = saved;
		},
		buttonsDisabled() {
			return !this.expression.language.isPractice || this.isFullMatch;
		},
		checkMatch() {
			const typedWord = this.typed;
			if (typedWord.length === 0) {
				this.nothingTyped = true;
				this.isNoMatch = false;
				this.isPartialMatch = false;
				this.isFullMatch = false;
				this.currentMaxLength = 1;
				return;
			}
			this.nothingTyped = false;
			const firstLettersMatch = this.checkFirstLettersMatch(this.expression.text, typedWord);
			if (firstLettersMatch) {
				if (typedWord.length > 0 && typedWord.length === this.expression.text.length) {
					this.isNoMatch = false;
					this.isPartialMatch = false;
					this.isFullMatch = true;
					this.$emit('fullMatched', this.rowOrder, true);
				} else {
					this.isNoMatch = false;
					this.isPartialMatch = true;
					this.isFullMatch = false;
					this.currentMaxLength = this.typed.length + 1;
				}
			} else {
				this.isNoMatch = true;
				this.isPartialMatch = false;
				this.isFullMatch = false;
				this.moreLettersAllowed = false;
			}
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
			this.focusInput();
		},
		show() {
			this.typed = this.expression.text;
		},
	},
},
);
</script>

<style scoped>

.partial-match {
  color: #198754;
}

.partial-match:focus {
  border-color: #198754;
  box-shadow: 0 0 0 0.2rem rgba(0,200,81,.25);
}

.full-match {
  background: #198754;
  color: #fff;
  font-weight: bold;
}

.no-match {
  color: #dc3545;
}

.no-match:focus {
  border-color: #dc3545;
  box-shadow: 0 0 0 0.2rem rgba(255,68,68,.25);
}

input {
  font-size: 1.1rem;
}
</style>
