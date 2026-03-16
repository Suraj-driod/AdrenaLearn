'use client'

import { db } from '../backend/firebase'
import { doc, setDoc, updateDoc } from 'firebase/firestore'

/**
 * Seeds Firestore with 4 Computer Engineering lessons and updates the CE course.
 * Call this function once from a component or browser console.
 */
export async function seedCELessons() {
  const lessons = [
    {
      id: 'variables',
      lessonName: 'Variables in Python',
      lessonDesc: 'Learn how to create and use variables in Python. Understand naming conventions, variable assignment, and how Python handles memory for variables.',
      lessonLink: 'https://www.youtube.com/embed/UOyMBJCH4Nc',
      lessonDuration: '20 min',
      lessonType: 'video',
      topic: 'variables',
      concepts: ['Variable Declaration', 'Assignment Operator', 'Naming Rules', 'Dynamic Typing'],
      chapters: [
        { time: '0:00', title: 'Introduction to Variables' },
        { time: '3:20', title: 'Naming Conventions' },
        { time: '7:45', title: 'Variable Assignment' },
        { time: '12:00', title: 'Dynamic Typing in Python' },
      ]
    },
    {
      id: 'data-types',
      lessonName: 'Data Types in Python',
      lessonDesc: 'Explore the fundamental data types in Python including integers, floats, strings, and booleans. Learn how to check and work with different data types.',
      lessonLink: 'https://www.youtube.com/embed/2CrVeIkcTeM',
      lessonDuration: '25 min',
      lessonType: 'video',
      topic: 'data-types',
      concepts: ['Integers', 'Floats', 'Strings', 'Booleans', 'type() Function'],
      chapters: [
        { time: '0:00', title: 'What are Data Types?' },
        { time: '4:30', title: 'Numbers: int and float' },
        { time: '9:00', title: 'Strings' },
        { time: '14:00', title: 'Booleans' },
      ]
    },
    {
      id: 'type-casting',
      lessonName: 'Type Casting in Python',
      lessonDesc: 'Master type conversion in Python. Learn how to convert between different data types using int(), float(), str(), and other casting functions.',
      lessonLink: 'https://www.youtube.com/embed/iDunq2m4mNo',
      lessonDuration: '18 min',
      lessonType: 'video',
      topic: 'type-casting',
      concepts: ['int()', 'float()', 'str()', 'Implicit vs Explicit Casting'],
      chapters: [
        { time: '0:00', title: 'Why Type Casting?' },
        { time: '3:00', title: 'Implicit Type Conversion' },
        { time: '7:30', title: 'Explicit Type Casting' },
        { time: '12:00', title: 'Common Casting Errors' },
      ]
    },
    {
      id: 'user-input',
      lessonName: 'Input from User in Python',
      lessonDesc: 'Learn how to take user input in Python using the input() function. Understand how to process, validate, and convert user inputs for your programs.',
      lessonLink: 'https://www.youtube.com/embed/iJBT4WCmP7c',
      lessonDuration: '15 min',
      lessonType: 'video',
      topic: 'user-input',
      concepts: ['input() Function', 'String Input', 'Converting Input', 'Input Validation'],
      chapters: [
        { time: '0:00', title: 'The input() Function' },
        { time: '4:00', title: 'Processing User Input' },
        { time: '8:00', title: 'Converting Input Types' },
        { time: '11:30', title: 'Input Validation Basics' },
      ]
    }
  ]

  try {
    // 1. Add each lesson document
    for (const lesson of lessons) {
      const { id, ...data } = lesson
      await setDoc(doc(db, 'lessons', id), data)
      console.log(`✅ Added lesson: ${id}`)
    }

    // 2. Update the CE course's courseLessons array
    const courseId = 'ce'
    await setDoc(doc(db, 'courses', courseId), {
      courseName: 'Computer Engineering',
      courseDesc: 'Master the fundamentals of programming with Python. From variables to algorithms, build a strong foundation.',
      courseLessons: lessons.map(l => l.id),
      difficulty: 'Beginner',
      estimatedDuration: '78 min',
      category: 'Computer Engineering',
      bgColor: 'bg-[#e4f1ff]',
      iconColor: 'text-[#3b82f6]'
    }, { merge: true })

    console.log(`✅ Updated course: ${courseId} with ${lessons.length} lessons`)
    return true
  } catch (error) {
    console.error('❌ Seed failed:', error)
    throw error
  }
}
