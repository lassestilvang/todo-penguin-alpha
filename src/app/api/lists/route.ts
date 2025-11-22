import { NextRequest, NextResponse } from 'next/server';
import { ListService } from '@/lib/lists';

export async function GET() {
  try {
    const lists = ListService.getAllLists();
    return NextResponse.json(lists);
  } catch (error) {
    console.error('Error fetching lists:', error);
    return NextResponse.json({ error: 'Failed to fetch lists' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const listData = await request.json();
    const list = ListService.createList(listData);
    return NextResponse.json(list);
  } catch (error) {
    console.error('Error creating list:', error);
    return NextResponse.json({ error: 'Failed to create list' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, ...listData } = await request.json();
    const list = ListService.updateList(id, listData);
    
    if (!list) {
      return NextResponse.json({ error: 'List not found' }, { status: 404 });
    }
    
    return NextResponse.json(list);
  } catch (error) {
    console.error('Error updating list:', error);
    return NextResponse.json({ error: 'Failed to update list' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get('id') || '');
    
    const success = ListService.deleteList(id);
    
    if (!success) {
      return NextResponse.json({ error: 'List not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting list:', error);
    return NextResponse.json({ error: 'Failed to delete list' }, { status: 500 });
  }
}
