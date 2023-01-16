![Example 1](public/img/logo.png)

TODO
- Use the word "practice" less

# Babilonia

Babilonia is an innovative tool for language enthusiasts who want to **grow and strengthen their vocabulary** in foreign languages. It seeks to unlock the power of vocabulary as a means to express your thoughts and understand native speakers. In a nutshell, as your vocabulary im
proves, so do your language skills!

At its core, Babilonia leverages your **muscle memory** to help you learn **more words**, **faster**. Also, unlike traditionnal methods, Babilonia lets you practice **multiple languages *at the same time***! :heart_eyes:

## Main features
- Allows you memorize a *maximum* amount of words in a *minimum* amount of time
- Contains clever tricks to help you remember words *as you're typing*
- Builds on top of partial knowledge of words
- Keeps track of how many words you know in each language
- Uses a novel method based on universal ideas
- Lets you practice any set of languages *all at once*!

## How it works

### Powerful help as you're practicing
A core component of Babilonia is its practice feature. It gives you *instant feedback* as you're typing, and *useful hints* when you need them. It's like your own personal teacher!

Babilonia's approach is to help you remember words *on your own*. Often, you will find you remember *some* part of a word, but not the word *in full*. Maybe you know the first letter, how it ends, or perhaps you just need a little hint for the memory to spring back to your mind. The expression "on the tip of one's tongue" exists for good reason!

In such instances, rather than revealing the full word, Babilonia can give you the next letter: a hint for the whole word. You can go from hint to hint like so, and type what you know when you know it. Not only is that more interactive and fun, but most importantly, through this way of practicing, you're much more likely to remember more parts of the word the next time around!

[Insert screenshot here]

In Babilonia, *partial knowledge* of a word is rewarded and built upon. If you know some letters in a word, you can still get it partially correct. Remembering more letters means progress, even if you don't remember the full word. That is very motivating, and also it lets you focus more on the letters that you actually didn't get right.

Of course, when you don't know, you don't know. You don't have to go through hints then: you can just get the full word revealed. After all, you have to start somewhere!

### A polyglot's paradise
Babilonia was designed to let users practice words *in many languages at the same time*. Most language tools are focused on learning one language at a time. But what if you want to master *multiple* languages? Wouldn't it be quite convenient to be able to practice *all of them, all at the same time*? Babilonia enables you to do just that!

There are many benefits. First, you get to exercise the mental gymnastics of *quickly switching between languages*, which is an invaluable skill for a polyglot. Also, you learn to *link together* the different words in different languages to convey the same idea, which help you remember them more easily. Plus, it's an incredibly efficient way to practice multiple languages when your goal is to master them.

However, even though you *could* practice tons of languages at the same time, it doesn't mean you *have* to! Maybe you'd like to focus on some languagues, or even just one. Maybe your goal is not even to become a polyglot! At any time, you can always choose which languages you would like to study.

### Easily track your progress and personalize your learning
Being able to track your progress is a key element to stay motivated. Babilonia can tell you how many words you know in each language. Seeing those numbers go up is, on its own, a worthwhile goal to have. It is also an excellent measure of your progress in any given language and can help you compare which languages you know more than others and to which extent.

[Insert screenshot here]

How it works is that you mark expressions as `known` as you encounter them. What qualifies as "known" is entirely up to you, as you are the best judge of whether you truly know an expression.

Marking expressions as known allows you to get a more personalized experience. Indeed, a useful setting to for known expressions to not appear when practicing. That way, you can focus on practicing only the expressions that you actually don't know!

### The concept of `ideas` and `expressions`
Ideas and expressions have a special meaning in Babilonia.

#### Expressions
Very often, an `expression` is simply a word, like `very`, `beer`, `cold` or `to drink`. However, it could also be an expression (literally), an idiom, a saying, or any otherwise useful sentence, for example: `how are you?`, `what's your name?`, `cost of living`, `it's raining cats and dogs`, and so on.

Thus, because `word` is too restrictive to fit this definition, `expressions` was chosen to represent this notion.

#### Ideas
As Babilonia lets you practice multiple languages at the same time, we soon run into interesting problems. Let's say you want to practice the word `to play`. In French, you can almost always translate that word with `jouer`. But in Spanish, you don't play soccer like you play piano, you `juegas` soccer and you `tocas` piano.

Such homonyms are very common and a lot of them are not so obvious, because we are so used to using them. And as you increase the number of languages, they become more and more apparent. To overcome this problem, we need to think of `meanings` more than we think of `words`.

When we think of the word `to play` as in to play a sport, we are thinking of a different idea than when we think of the word `to play` as in to play an instrument. It's not even immediately obvious why we use the same word to express those two distinct ideas. Therefore, why would we practice them together then?

In Babilonia, you practice one `idea` at a time. You learn which `expression` allows you to convey that specific `idea` in each language.

An `idea` is any concept that exists in our minds and that can be expressed through `expressions` in a given language. Put simply, the `idea` is the notion, and the `expression` is the word that we use to express it. An `expression` has a language, an `idea` does not.

Picture a house. The image in your head is the `idea`, and `house` is the `expression` in English. In French, the `expression` is `maison`; in German, it's `Haus`, in Spanish, `casa`, and so on. But the `idea` is the same. And although it's harder to picture more abstract ideas such as `love`, `strength` or `how are you?`, the same basic concept holds.

Some words do not have a direct translation in other languages. Usually, however, the `idea` can be distilled from it and translated with expressions in other languages. For example, the French do not have a dedicated word for `siblings`, but they will say `frères et soeurs` to convey the same meaning. `Siblings` is still a concept in itself, irrelevent of the `expressions` used to represent it.

### Context where necessary
Sometimes, the same word can have multiple meanings. For example, in French, `avocat` can mean attorney or avocado, depending on context. So if you see that word, you might wonder which idea it is. Contexts are just for that.

A context is additional information in an expression that only serves to identify which idea it represents. It is put inside parentheses and is not practiced. For example, `avocat (fruit)` makes it clear that attorney is not the right answer.

### Simplified accents and keyboard layouts
If you want to practice multiple languages at the same time, and those languages use different alphabets, you may not want to constantly be changing your keyboard settings. Or maybe you think you can learn faster if you forget about accents first. That's why you can disable "strict mode" and, for instance, `e` will be accepted for `é`.

### The data
The application's data is stored in the `db.db` file at the project's root in `SQLite` format.

You can either start empty and add your own ideas, or you can import predefined ideas. Predefined ideas are a list that grows with each release. If you choose to import predefined ideas, be aware that those ideas could change in a future update. Your custom-added ideas will not be touched.

### Finally: one important caveat
Of course, vocabulary is only one part of language learning. That's why Babilonia does not seek to be the *be-all and end-all* of language learning tools. In fact, *nothing* is. Learning languages require a variety of sources. *However*, we believe that acquiring vocabulary is the single most important aspect of learning languages, that unlocks a world of possibilities. Babilonia fulfills that goal in a powerful way.

## Passive mode

## What Babilonia is not

## FAQ

## Options

## How do I run it?

### Prerequisites

All you need is `node` (tested with `16.16.0`) and `Chromium` or `Firefox`. Grab the most recent release, `cd` into your download folder and execute `node index.cjs`.

## License

This project is licensed under the terms of the MIT License (https://opensource.org/licenses/MIT).

## Can I contribute?

Of course! Feel free to open an issue or make a pull request.

## Any questions?

Do not hesitate to contact me at emile.pharand.github@gmail.com :smile:
<br>
<br>
<br>
<sub>People often say that motivation doesn't last. Well, neither does bathing — that's why we recommend it daily. - Zig Ziglar</sub>